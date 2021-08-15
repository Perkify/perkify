// unknown, what happens during the hour that the invoice takes to process?
// doesn't matter, they will all be independent invoices
// and the subscription creation only happens once
// not going off of the subscription update

import { allPerksDict, newUserTemplateGenerator } from '../../shared';
import admin, {
  db,
  firebaseFunctionsUrl,
  functions,
  queuePath,
  stripe,
  tasksClient,
} from '../models';

interface syncUsersWithBusinessDocumentPerkGroupPayload {
  businessID: string;
  businessData: Business;
}

export const syncUsersWithBusinessDocumentPerkGroupDelayed = async (
  payload: syncUsersWithBusinessDocumentPerkGroupPayload,
  expirationAtSeconds: number
) => {
  // problem with holidays and stuff
  const url = firebaseFunctionsUrl + '/syncUsersWithBusinessDocumentPerkGroup';

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url,
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    scheduleTime: {
      seconds: expirationAtSeconds,
    },
  };

  await tasksClient.createTask({ parent: queuePath, task });
};

export const createUserHelper = async (email, businessID, group, perks) => {
  const docRef = db.collection('users').doc(email);

  await docRef.set({
    businessID,
    group,
    perks: perks.reduce((map, perk) => ((map[perk] = []), map), {}),
  });

  const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
    url:
      functions.config()['stripe-firebase'].environment == 'production'
        ? 'https://app.getperkify.com/dashboard'
        : functions.config()['stripe-firebase'].environment == 'staging'
        ? 'https://app.dev.getperkify.com/dashboard'
        : 'http://localhost:3001/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
  });

  // send email
  await db.collection('mail').add({
    to: email,
    message: {
      subject: 'Your employer has signed you up for Perkify!',
      html: newUserTemplateGenerator({ signInLink }),
    },
  });
};

export const updateUserHelper = async (
  email,
  businessID,
  group,
  oldPerks,
  newPerks
) => {
  const docRef = db.collection('users').doc(email);

  const oldUserNewPerks = newPerks.reduce((acc, perk) => {
    if (perk in oldPerks) {
      acc[perk] = oldPerks[perk];
    } else {
      acc[perk] = [];
    }
    return acc;
  }, {});

  await docRef.set({
    businessID,
    group,
    perks: oldUserNewPerks,
  });

  // // does this create a user?
  // const signInLink = await admin.auth().generateSignInWithEmailLink(email, {
  //   url:
  //     functions.config()['stripe-firebase'].environment == 'production'
  //       ? 'https://app.getperkify.com/dashboard'
  //       : functions.config()['stripe-firebase'].environment == 'staging'
  //       ? 'https://app.dev.getperkify.com/dashboard'
  //       : 'http://localhost:3001/dashboard', // I don't think you're supposed to do it this way. Maybe less secure
  // });

  // // send email
  // await db.collection('mail').add({
  //   to: email,
  //   message: {
  //     subject: 'Your employer has signed you up for Perkify!',
  //     html: newUserTemplateGenerator({ signInLink }),
  //   },
  // });
};

export const deleteUserHelper = async (userDoc) => {
  if (userDoc.data().card)
    await stripe.issuing.cards.update(userDoc.data().card.id, {
      status: 'canceled',
    });
  await db.collection('users').doc(userDoc.id).delete();
};

// takes an admin id and business id
// updates the stripe subscription to match the perks and employees in the business document
// to be used after making an update to a single perk group
// must be called separately for each updated perk group
export const syncStripeSubscriptionsWithFirestorePerks = async (
  userUid,
  businessID,
  perkGroupName
) => {
  // get business data
  const businessData = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  if (!businessData) {
    const error = {
      status: 500,
      reason: 'Missing document',
      reasonDetail: 'Could not find business data document',
    };
    throw error;
  }

  // get customer data
  const customerData = (
    await db.collection('customers').doc(userUid).get()
  ).data();

  if (customerData == null) {
    const error = {
      status: 500,
      reason: 'Missing documents',
      reasonDetail: `Documents missing from firestore`,
    };
    throw error;
  }

  // remove stuff that shouldn't exist from 'users'
  await syncBusinessDocRemovalsToUserDocuments(businessID);

  const perkCountsByName = Object.keys(businessData.groups).reduce(
    (accumulator, perkGroupName) => {
      businessData.groups[perkGroupName].perks.forEach((perkName) => {
        if (accumulator[perkName]) {
          accumulator[perkName] +=
            businessData.groups[perkGroupName].employees.length;
        } else {
          accumulator[perkName] =
            businessData.groups[perkGroupName].employees.length;
        }
      });
      return accumulator;
    },
    {}
  );

  // convert the count of each perk to a list of items
  const newSubscriptionItemsList = Object.keys(perkCountsByName).map(
    (perkName) => ({
      price: allPerksDict[perkName].stripePriceId,
      quantity: perkCountsByName[perkName],
    })
  );

  // check if the customer has an existing active subscriptions
  const subscriptionsSnapshot = await db
    .collection('customers')
    .doc(userUid)
    .collection('subscriptions')
    .get();

  const subscriptionItem = subscriptionsSnapshot.docs.filter(
    (doc) => doc.data().canceled_at == null
  );

  if (subscriptionItem.length == 0) {
    // the admin doesn't have any subscriptions
    // create a subscription for them
    // this metadata will become invalid when the subscription is updated,
    // but it is only used after creation

    // can only pass strings
    // so instead create a firestore document or each
    // could create a separate one for each invoice,
    // or pray that the payment is fast enough to just be able to read
    // the business document itself
    // i was planning on just updating the subscription object anyways
    // so it should be fast enough. Okay so i'll go with that. Just read from the business document

    // okay but so how to handle specifying the perkGroup that has been changed?
    // in the metadata of the invoice!
    await stripe.subscriptions.create({
      customer: customerData.stripeId,
      items: newSubscriptionItemsList,
      metadata: { businessID },
    });
  } else {
    // the admin is already subscribed
    // update the subscription to reflect the new item quantities
    // add item ids to existing subscriptions prices
    for (let i = 0; i < newSubscriptionItemsList.length; i++) {
      newSubscriptionItemsList[i]['id'] = subscriptionItem[0]
        .data()
        .items.filter(
          (item) => item.price.id == newSubscriptionItemsList[i].price
        )?.[0]?.id;
    }

    await stripe.subscriptions.update(subscriptionItem[0].id, {
      items: newSubscriptionItemsList,
    });

    // create an invoice to charge the difference of the subscription
    const createdInvoice = await stripe.invoices.create({
      customer: customerData.stripeId,
      // auto_advance: true,
      collection_method: 'charge_automatically',
      subscription: subscriptionItem[0].id,
      metadata: { businessID, perkGroupName },
    });

    // finalize the invoice
    await stripe.invoices.finalizeInvoice(createdInvoice.id, {
      // auto_advance: true,
    });

    // pay the invoice
    await stripe.invoices.pay(createdInvoice.id, {
      // auto_advance: true,
    });
  }
};

// i'm doing intersection to avoid creating things that should not be created yet
// but i want to do union to leave everything in the businessDoc alone and only add things
// we aren't changing the businessDoc, we are changing the user docs!

// takes a snapshot of the business document,
// and makes the relevant changes to the users collection
// call from snapshot
export const syncUsersWithBusinessDocumentPerkGroup = async (req, res) => {
  const { businessID, businessData } =
    req.body as syncUsersWithBusinessDocumentPerkGroupPayload;

  const newBusinessData = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  // what about later when we want to handle moving users?
  // it's just going to appear as a diff, we want to be able to catch that
  // scope things outside, that should be chill

  // how does this relate to deleting users?
  // we are not changing the business doc

  // what if a user exists that shouldn't exist?
  // they should be deleted, but no such users should exist, because they should be deleted immediately
  // same with removing perks. Should never be the case that you are removing perks

  const usersToCreate: {
    email: string;
    newPerks: string[];
    perkGroupName: string;
  }[] = [];
  const usersToUpdate: {
    email: string;
    oldPerks: { [key: string]: string[] };
    newPerks: string[];
    perkGroupName: string;
  }[] = [];
  const usersToDelete: string[] = [];

  // process each perk group separately
  Object.keys(businessData.groups).forEach(async (perkGroupName) => {
    // TODO: improve this so that we can instantly tell if a perkGroup has changed
    // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

    const intersectedPerkGroupData = {
      perks: newBusinessData.groups[perkGroupName].perks.filter((perkName) =>
        businessData.groups[perkGroupName].perks.includes(perkName)
      ),
      employees: newBusinessData.groups[perkGroupName].employees.filter(
        (employee) =>
          businessData.groups[perkGroupName].employees.includes(employee)
      ),
    };

    // get existing users
    const businessUsersRef = await db
      .collection('users')
      .where('businessID', '==', businessID);

    // we just keep track of their email address
    // it doesn't create them a user when the signup?
    // i guess not
    const existingUsersSnapshot = await businessUsersRef
      .where('group', '==', perkGroupName)
      .get();

    // you want to set it to be whatever is in intersectedPerkGroupData
    const existingUsersDict = {};
    existingUsersSnapshot.forEach((userDoc) => {
      // build the existingUsersDict
      existingUsersDict[userDoc.id] = userDoc.data();

      if (!intersectedPerkGroupData.employees.includes(userDoc.id)) {
        // user does exist but is not in the businessData doc
        // delete the user
        // this should never happen
        usersToDelete.push(userDoc.id);
      }
    });

    // using create update
    intersectedPerkGroupData.employees.map((employee) => {
      // What emails do we want to send here?
      // if the email doesn't exist, we send account creation email
      // if it does exist, we send perk update email

      // check if user exists
      if (employee in existingUsersDict) {
        // user exists
        usersToUpdate.push({
          email: employee,
          oldPerks: existingUsersDict[employee].perks,
          newPerks: intersectedPerkGroupData.perks,
          perkGroupName,
        });
      } else {
        usersToCreate.push({
          email: employee,
          newPerks: intersectedPerkGroupData.perks,
          perkGroupName,
        });
      }
    });
  });

  // create users
  await Promise.all(
    usersToCreate.map(({ email, perkGroupName, newPerks }) =>
      createUserHelper(email, businessID, perkGroupName, newPerks)
    )
  );

  // update users
  await Promise.all(
    usersToUpdate.map(({ email, oldPerks, newPerks, perkGroupName }) => {
      updateUserHelper(email, businessID, perkGroupName, oldPerks, newPerks);
    })
  );

  // assert that there are no users to be deleted
  if (usersToDelete.length != 0) {
    console.error(
      'Error users to delete is not 0 in syncUsersWithBusinessDocumentPerkGroup'
    );
    // await Promise.all(usersToDelete.map((email) => deleteUserHelper(email)));
  }

  res.json({ received: true });
};

export const syncBusinessDocRemovalsToUserDocuments = async (businessID) => {
  const newBusinessData = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  const usersToCreate: {
    email: string;
    newPerks: string[];
    perkGroupName: string;
  }[] = [];
  const usersToUpdate: {
    email: string;
    oldPerks: { [key: string]: string[] };
    newPerks: string[];
    perkGroupName: string;
  }[] = [];
  const usersToDelete: string[] = [];

  // process each perk group separately
  Object.keys(newBusinessData.groups).forEach(async (perkGroupName) => {
    // TODO: improve this so that we can instantly tell if a perkGroup has changed
    // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

    // get existing users
    const businessUsersRef = await db
      .collection('users')
      .where('businessID', '==', businessID);

    // we just keep track of their email address
    // it doesn't create them a user when the signup?
    // i guess not
    const existingUsersSnapshot = await businessUsersRef
      .where('group', '==', perkGroupName)
      .get();

    // skip if there are no docs
    if (existingUsersSnapshot.docs.length == 0) {
      return;
    }

    // filter the perks available to employees
    const userPerks = Object.keys(
      (existingUsersSnapshot.docs[0].data() as User).perks
    );
    const userEmails = existingUsersSnapshot.docs.map((userDoc) => userDoc.id);

    const intersectedPerkGroupData = {
      perks: newBusinessData.groups[perkGroupName].perks.filter((perkName) =>
        userPerks.includes(perkName)
      ),
      employees: newBusinessData.groups[perkGroupName].employees.filter(
        (employee) => userEmails.includes(employee)
      ),
    };

    // you want to set it to be whatever is in intersectedPerkGroupData
    const existingUsersDict = {};
    existingUsersSnapshot.forEach((userDoc) => {
      // build the existingUsersDict
      existingUsersDict[userDoc.id] = userDoc.data();

      if (!intersectedPerkGroupData.employees.includes(userDoc.id)) {
        // user does exist but is not in the businessData doc
        // delete the user
        // this should never happen
        usersToDelete.push(userDoc.id);
      }
    });

    // using create update
    intersectedPerkGroupData.employees.map((employee) => {
      // What emails do we want to send here?
      // if the email doesn't exist, we send account creation email
      // if it does exist, we send perk update email

      // check if user exists
      if (employee in existingUsersDict) {
        // user exists
        usersToUpdate.push({
          email: employee,
          oldPerks: existingUsersDict[employee].perks,
          newPerks: intersectedPerkGroupData.perks,
          perkGroupName,
        });
      } else {
        usersToCreate.push({
          email: employee,
          newPerks: intersectedPerkGroupData.perks,
          perkGroupName,
        });
      }
    });
  });

  // assert that there are no users to create
  if (usersToCreate.length != 0) {
    console.error(
      'Error users to create is not 0 in syncBusinessDocRemovalsToUserDocuments'
    );

    // await Promise.all(
    //   usersToCreate.map(({ email, perkGroupName, newPerks }) =>
    //     createUserHelper(email, businessID, perkGroupName, newPerks)
    //   )
    // );
  }

  // update users
  await Promise.all(
    usersToUpdate.map(({ email, oldPerks, newPerks, perkGroupName }) => {
      updateUserHelper(email, businessID, perkGroupName, oldPerks, newPerks);
    })
  );

  // delete users
  await Promise.all(usersToDelete.map((email) => deleteUserHelper(email)));
};
