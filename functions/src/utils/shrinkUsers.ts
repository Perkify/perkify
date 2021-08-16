import { db } from '../models';
import { deleteUserHelper, updateUserHelper } from './crudHelpers';

export const shrinkUsers = async (businessID) => {
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
