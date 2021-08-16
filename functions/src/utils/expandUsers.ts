import { db } from '../models';
import { createUserHelper, updateUserHelper } from './crudHelpers';

// i'm doing intersection to avoid creating things that should not be created yet
// but i want to do union to leave everything in the businessDoc alone and only add things
// we aren't changing the businessDoc, we are changing the user docs!

// takes a snapshot of the business document,
// and makes the relevant changes to the users collection
// call from snapshot
export const expandUsers = async (oldBusiness) => {
  const newBusinessData = (
    await db.collection('businesses').doc(oldBusiness.id).get()
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
  Object.keys(oldBusiness.groups).forEach(async (perkGroupName) => {
    // TODO: improve this so that we can instantly tell if a perkGroup has changed
    // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

    const intersectedPerkGroupData = {
      perks: newBusinessData.groups[perkGroupName].perks.filter((perkName) =>
        oldBusiness.groups[perkGroupName].perks.includes(perkName)
      ),
      employees: newBusinessData.groups[perkGroupName].employees.filter(
        (employee) =>
          oldBusiness.groups[perkGroupName].employees.includes(employee)
      ),
    };

    // get existing users
    const businessUsersRef = await db
      .collection('users')
      .where('businessID', '==', oldBusiness);

    // we just keep track of their email address
    // it doesn't create them a user when the signup?
    // i guess not
    const existingUsersSnapshot = await businessUsersRef
      .where('perkGroup', '==', perkGroupName)
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
      createUserHelper(email, oldBusiness.id, perkGroupName, newPerks)
    )
  );

  // update users
  await Promise.all(
    usersToUpdate.map(({ email, oldPerks, newPerks, perkGroupName }) => {
      updateUserHelper(
        email,
        oldBusiness.id,
        perkGroupName,
        oldPerks,
        newPerks
      );
    })
  );

  // assert that there are no users to be deleted
  if (usersToDelete.length != 0) {
    console.error(
      'Error users to delete is not 0 in syncUsersWithBusinessDocumentPerkGroup'
    );
    // await Promise.all(usersToDelete.map((email) => deleteUserHelper(email)));
  }
};
