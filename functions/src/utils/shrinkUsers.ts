import { db } from '../models';
import {
  generateDictFromSnapshot,
  generateEmailsPatch,
  generatePerkGroupIntersection,
} from '../utils';
import { deleteUserHelper, updateUserHelper } from './crudHelpers';

export const shrinkUsers = async (updatedBusiness: Business) => {
  const businessID = updatedBusiness.businessID;
  const usersToCreate: UserToCreate[] = [];
  const usersToUpdate: UserToUpdate[] = [];
  const usersToDelete: UserToDelete[] = [];

  // process each perk group separately
  Object.keys(updatedBusiness.perkGroups).forEach(async (perkGroupName) => {
    // TODO: improve this so that we can instantly tell if a perkGroup has changed
    // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

    const updatedPerkGroup = updatedBusiness.perkGroups[perkGroupName];

    // get existing users
    const existingPerkUsersSnapshot = await db
      .collection('users')
      .where('businessID', '==', updatedBusiness.businessID)
      .where('perkGroup', '==', perkGroupName)
      .get();

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

    // intersect updatedPerkGroup with livePerkGroup
    // to get a subset of the livePerkGroup
    // that we will apply to livePerkGroup
    // in order to shrink it
    const intersectedPerkGroupData = generatePerkGroupIntersection(
      updatedPerkGroup,
      livePerkGroup
    );

    // get the emails patch
    // you want to apply the intersected perk group data to the live emails
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

  // assert that there are no users to create
  if (usersToCreate.length != 0) {
    console.error(
      'Error users to create is not 0 in syncBusinessDocRemovalsToUserDocuments'
    );
  }

  // update users
  await Promise.all(usersToUpdate.map(updateUserHelper));

  // delete users
  await Promise.all(usersToDelete.map(deleteUserHelper));
};
