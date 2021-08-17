import { db } from '../models';
import {
  createUserHelper,
  deleteUserHelper,
  updateUserHelper,
} from './crudHelpers';
import { generateDictFromSnapshot } from './firestoreHelpers';
import {
  generateEmailsPatch,
  generatePerkGroupIntersection,
} from './perkGroupHelpers';

// modificationType indicates whether we are expanding or shrinking live users
export const applyChangesToLiveUsers = async (
  updatedBusiness: Business,
  modificationType: 'expand' | 'shrink'
) => {
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

    // get existing users
    const existingPerkUsersSnapshot = await db
      .collection('users')
      .where('businessID', '==', updatedBusiness.businessID)
      .where('perkGroup', '==', perkGroupName)
      .get();

    const existingPerkUsersDict = generateDictFromSnapshot(
      existingPerkUsersSnapshot
    ) as Record<string, SimpleUser>;

    const pendingPerkGroup = pendingBusiness.perkGroups[perkGroupName];
    const updatedPerkGroup = updatedBusiness.perkGroups[perkGroupName];
    const livePerkGroup = {
      perks: Object.keys(
        (existingPerkUsersSnapshot.docs[0].data() as SimpleUser).perks
      ),
      emails: existingPerkUsersSnapshot.docs.map((userDoc) => userDoc.id),
    } as PerkGroup;

    // EXPAND
    // get the intersection of the updatedPerkGroup and the pendingPerkGroup
    // livePerkGroup a subset of both the pendingPerkGroup and then updatedPerkGroup
    // so the intersection is a superset of the intersection of livePerkGroup
    // therefore we are only going to be expanding the live users
    // when we put the intersection on the live users

    // we need livePerkGroup to be a subset of updatedPerkGroup
    // but is that the case?
    // updatedPerkGroup is based off of pendingPerkGroup
    // which means it includes any expansions that would be made to
    // livePerkGroup
    // as longs as expansions stay in order.
    // if expansions go out of order, than this won't necessarily be the case
    // this means we gotta prevent expansions from going out of order

    // SHRINK
    // intersect updatedPerkGroup with livePerkGroup
    // to get a subset of the livePerkGroup
    // that we will apply to livePerkGroup
    // in order to shrink it
    const intersectedPerkGroupData = generatePerkGroupIntersection(
      updatedPerkGroup,
      modificationType === 'expand' ? pendingPerkGroup : livePerkGroup
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

  const applyChanges: Promise<void>[] = [];

  // create users
  if (modificationType === 'expand') {
    // modification type === 'expand'
    applyChanges.push(...usersToCreate.map(createUserHelper));
  } else {
    // modification type === 'shrink'

    // assert that there are no users to create
    if (usersToCreate.length != 0) {
      console.error(
        'Error users to create is not 0 in syncBusinessDocRemovalsToUserDocuments'
      );
    }
  }

  // update users
  applyChanges.push(...usersToUpdate.map(updateUserHelper));

  // delete users
  if (modificationType === 'expand') {
    // modification type === 'expand'

    // assert that there are no users to be deleted
    if (usersToDelete.length != 0) {
      console.error(
        'Error users to delete is not 0 in syncUsersWithBusinessDocumentPerkGroup'
      );
    }
  } else {
    // modification type === 'shrink'
    applyChanges.push(...usersToDelete.map(deleteUserHelper));
  }
  await Promise.all(applyChanges);
};
