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

export const syncUsersWithBusinessDocumentPerkGroupDelayed = async (
  payload: {
    businessID: string;
    perkGroupName: string;
    perkGroupData: PerkGroup;
  },
  expirationAtSeconds
) => {
  // problem with holidays and stuff
  const url = firebaseFunctionsUrl + '/firestoreTtlCallback';

  const task = {
    httpRequest: {
      httpMethod: 'POST' as 'POST',
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

  // // get the business employees
  // const businessEmployees = await db
  //   .collection('users')
  //   .where('businessID', '==', businessID)
  //   .get();

  // // count how many of each perk the business has registered employees for
  // const perkGroupEmployeeCounts = businessEmployees.docs.reduce(
  //   (accumulator, employeeDoc) => {
  //     const employee = employeeDoc.data();

  //     if (accumulator[employee.group]) {
  //       accumulator[employee.group] += 1;
  //     } else {
  //       accumulator[employee.group] = 1;
  //     }
  //     return accumulator;
  //   },
  //   {}
  // );

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
        )?.[0].id;
    }

    await stripe.subscriptions.update(subscriptionItem[0].id, {
      items: newSubscriptionItemsList,
    });

    // create an invoice to charge the difference of the subscription
    await stripe.invoices.create({
      customer: customerData.stripeId,
      auto_advance: true,
      collection_method: 'charge_automatically',
      subscription: subscriptionItem[0].id,
      metadata: { businessID, perkGroupName },
    });
  }
};

// takes a snapshot of the business document,
// and makes the relevant changes to the users collection
// call from snapshot
export const syncUsersWithBusinessDocumentPerkGroup = async (
  businessID,
  perkGroup: string,
  perkGroupData: PerkGroup
) => {
  const newPerkGroupData = (
    (await db.collection('businesses').doc(businessID).get()).data() as Business
  ).groups[perkGroup];

  const intersectedPerkGroupData = {
    perks: newPerkGroupData.perks.filter((perkGroup) =>
      perkGroupData.perks.includes(perkGroup)
    ),
    employees: newPerkGroupData.employees.filter((employee) =>
      perkGroupData.employees.includes(employee)
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
    .where('group', '==', perkGroup)
    .get();

  // you want to set it to be whatever is in intersectedPerkGroupData
  // but you also need to delete users that don't exist

  const existingUsersDict = {};
  const usersToDelete: string[] = [];
  const usersToUpdate: {
    email: string;
    oldPerks: { [key: string]: string[] };
  }[] = [];
  const usersToCreate: string[] = [];

  existingUsersSnapshot.forEach((userDoc) => {
    // build the existingUsersDict
    existingUsersDict[userDoc.id] = userDoc.data();

    if (!intersectedPerkGroupData.employees.includes(userDoc.id)) {
      // user does exist but shouldn't exist
      // delete the user
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
      });
    } else {
      usersToCreate.push(employee);
    }
  });

  // check if user exists in another business
  // realizing that this check is being made 2 days later, can throw an error at that point...
  // that complicates things a bit
  // so one option is to read all business documents and check if any of them have the user

  // we need to read users from all of the business documents. Ideally we would use an index for this, not a long term solution
  // better solution is to support employees in multiple businesses, or use another collection for keeping track of "claimedEmails"

  const businessesSnapshot = await db.collection('businesses').get();

  const allEmployeesAcrossBusinesses: string[] = [];
  businessesSnapshot.forEach((businessDoc) => {
    allEmployeesAcrossBusinesses.concat(
      ...Object.values((businessDoc.data() as Business).groups).map(
        (perkGroup) => perkGroup.employees
      )
    );
  });

  // check if any of the emails to create exist across all businesses
  const emailThatExistsInAnotherBusiness = usersToCreate.find((email) =>
    allEmployeesAcrossBusinesses.includes(email)
  );

  if (emailThatExistsInAnotherBusiness) {
    const error = {
      status: 400,
      reason: 'Bad Request',
      reasonDetail: `added email ${emailThatExistsInAnotherBusiness} that is already in another group`,
    };
    // throwing error so that it can get caught
    // by the caller which will then call next(error)
    throw error;
  }

  // create users
  await Promise.all(
    usersToCreate.map((email) =>
      createUserHelper(
        email,
        businessID,
        perkGroup,
        intersectedPerkGroupData.perks
      )
    )
  );

  // delete users
  await Promise.all(usersToDelete.map((email) => deleteUserHelper(email)));

  // update users
  await Promise.all(
    usersToUpdate.map(({ email, oldPerks }) => {
      updateUserHelper(
        email,
        businessID,
        perkGroup,
        oldPerks,
        intersectedPerkGroupData.perks
      );
    })
  );
};
