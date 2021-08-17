import { db } from '../models';
import {
  generateDictFromSnapshot,
  generateEmailsPatch,
  generatePerkGroupIntersection,
} from '../utils';
import { createUserHelper, updateUserHelper } from './crudHelpers';

export const expandUsers = async (updatedBusiness: Business) => {
  const businessID = updatedBusiness.businessID;
  const usersToCreate: UserToCreate[] = [];
  const usersToUpdate: UserToUpdate[] = [];
  const usersToDelete: UserToDelete[] = [];

  // TODO what if pending business is not defined?
  const pendingBusiness = (
    await db.collection('businesses').doc(businessID).get()
  ).data() as Business;

  // process each perk group separately
  Object.keys(updatedBusiness.perkGroups).forEach(async (perkGroupName) => {
    // TODO: improve this so that we can instantly tell if a perkGroup has changed
    // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

    // TODO what if a perk group has been deleted?
    const pendingPerkGroup = pendingBusiness.perkGroups[perkGroupName];
    const updatedPerkGroup = updatedBusiness.perkGroups[perkGroupName];

    // get existing users
    const existingPerkUsersSnapshot = await db
      .collection('users')
      .where('businessID', '==', updatedBusiness.businessID)
      .where('perkGroup', '==', perkGroupName)
      .get();

    // // skip if there are no docs. not for expand users
    // if (existingPerkUsersSnapshot.docs.length == 0) {
    //   return;
    // }

    const existingPerkUsersDict = generateDictFromSnapshot(
      existingPerkUsersSnapshot
    ) as Record<string, SimpleUser>;

    // filter the perks available to employees
    const livePerkGroup = {
      perks: Object.keys(
        (existingPerkUsersSnapshot.docs[0].data() as SimpleUser).perks
      ),
      emails: existingPerkUsersSnapshot.docs.map((userDoc) => userDoc.id),
    } as PerkGroup;

    // get the intersection of the new business document with the old business document
    // live users are a subset of the new business document
    // so the intersection is a superset of the intersection of users with new business document
    // therefore we are only going to be expanding the live users
    // when we put the intersection on the live users
    const intersectedPerkGroupData = generatePerkGroupIntersection(
      pendingPerkGroup,
      updatedPerkGroup
    ) as PerkGroup;

    // you want to apply the intersected perk group data to the live users
    // get the emails patch
    const { emailsToCreate, emailsToUpdate, emailsToDelete } =
      generateEmailsPatch(
        intersectedPerkGroupData.emails,
        livePerkGroup.emails
      );

    usersToCreate.push(
      ...emailsToCreate.map((email) => ({
        email,
        newPerks: intersectedPerkGroupData.perks,
        perkGroupName,
        businessID,
      }))
    );

    usersToUpdate.push(
      ...emailsToUpdate.map((email) => ({
        email,
        newPerks: intersectedPerkGroupData.perks,
        oldPerks: existingPerkUsersDict[email].perks,
        perkGroupName,
      }))
    );

    usersToDelete.push(
      ...emailsToDelete.map((email) => ({
        email,
      }))
    );
  });

  // create users
  await Promise.all(usersToCreate.map(createUserHelper));

  // update users
  await Promise.all(usersToUpdate.map(updateUserHelper));

  // assert that there are no users to be deleted
  if (usersToDelete.length != 0) {
    console.error(
      'Error users to delete is not 0 in syncUsersWithBusinessDocumentPerkGroup'
    );
  }
};
