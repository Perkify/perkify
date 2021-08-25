import { logger } from 'firebase-functions';
import { db } from '../services';
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

  const pendingBusinessDoc = await db
    .collection('businesses')
    .doc(businessID)
    .get();

  if (!pendingBusinessDoc.exists) {
    throw new Error('Missing business document in firestore');
  }

  const pendingBusiness = pendingBusinessDoc.data() as Business;

  // get existing users
  const existingUsersSnapshot = await db
    .collection('users')
    .where('businessID', '==', updatedBusiness.businessID)
    .get();

  const existingUsersDict = generateDictFromSnapshot(
    existingUsersSnapshot
  ) as Record<string, User>;

  // get a list of the perk names we would be expanding to
  const expandingFromPerkGroupNames = Object.keys(updatedBusiness.perkGroups);

  // get a list of all the perk names we would be shrinking from
  const shrinkingFromPerkGroupNames = Array.from(
    new Set(
      Object.keys(existingUsersDict).map(
        (userID) => existingUsersDict[userID].perkGroupName
      )
    )
  );

  // pick the important list of perk names
  const importantPerkGroupNames =
    modificationType === 'expand'
      ? expandingFromPerkGroupNames
      : shrinkingFromPerkGroupNames;

  // process each perk group separately
  await Promise.all(
    importantPerkGroupNames.map(async (perkGroupName) => {
      // TODOFUTURE: improve this so that we can instantly tell if a perkGroup has changed
      // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

      const existingPerkUserDocs = existingUsersSnapshot.docs.filter(
        (userDoc) => (userDoc.data() as User).perkGroupName === perkGroupName
      );

      const pendingPerkGroup =
        pendingBusiness.perkGroups[perkGroupName] ||
        ({ perkNames: [], userEmails: [] } as PerkGroup);
      const updatedPerkGroup =
        updatedBusiness.perkGroups[perkGroupName] ||
        ({ perkNames: [], userEmails: [] } as PerkGroup);

      const livePerkGroup =
        existingPerkUserDocs.length != 0
          ? ({
              perkNames: Object.keys(
                (existingPerkUserDocs[0].data() as User).perkUsesDict
              ),
              userEmails: existingPerkUserDocs.map((userDoc) => userDoc.id),
            } as PerkGroup)
          : ({ perkNames: [], userEmails: [] } as PerkGroup);

      // EXPAND
      // get the intersection of the updatedPerkGroup and the pendingPerkGroup
      // livePerkGroup a subset of both the pendingPerkGroup and the updatedPerkGroup
      // so the intersection is a superset of the intersection of livePerkGroup
      // therefore we are only going to be expanding the live users
      // when we put the intersection on the live users

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
      const { emailsToCreate, emailsToUpdate, emailsToDelete } =
        generateEmailsPatch(
          intersectedPerkGroupData.userEmails,
          livePerkGroup.userEmails
        );

      usersToCreate.push(
        ...emailsToCreate.map((email) => ({
          email,
          newPerkNames: intersectedPerkGroupData.perkNames,
          perkGroupName,
          businessID,
        }))
      );

      usersToUpdate.push(
        ...emailsToUpdate.map((email) => ({
          email,
          newPerkNames: intersectedPerkGroupData.perkNames,
          oldPerkUsesDict: existingUsersDict[email].perkUsesDict,
          perkGroupName,
        }))
      );

      usersToDelete.push(
        ...emailsToDelete.map((email) => ({
          email,
          card: existingUsersDict[email].card,
        }))
      );

      console.log(
        intersectedPerkGroupData.userEmails,
        livePerkGroup.userEmails,
        emailsToDelete,
        modificationType
      );
    })
  );
  logger.info(
    `Applying changes to live users for business: [${businessID}] in ${modificationType} mode`,
    {
      updatedBusiness,
      usersToCreate,
      usersToUpdate,
      usersToDelete,
    }
  );
  const applyChanges: Promise<void>[] = [];

  // create users
  if (modificationType === 'expand') {
    // modification type === 'expand'

    applyChanges.push(...usersToCreate.map(createUserHelper));

    // update users
    applyChanges.push(...usersToUpdate.map(updateUserHelper));

    if (
      usersToUpdate.some((userToUpdate) =>
        Object.keys(userToUpdate.oldPerkUsesDict).some(
          (perkName) => !userToUpdate.newPerkNames.includes(perkName)
        )
      )
    ) {
      logger.error(
        'newPerkNames is not a superset of oldPerkUsesDict when expanding live users'
      );
    }

    // assert that there are no users to be deleted
    if (usersToDelete.length != 0) {
      logger.error('Error users to delete is not 0 when expanding live users');
    }
  } else {
    // modification type === 'shrink'

    // assert that there are no users to create
    if (usersToCreate.length != 0) {
      logger.error('Error users to create is not 0 when shrinking live users');
    }

    // update users
    applyChanges.push(...usersToUpdate.map(updateUserHelper));

    if (
      usersToUpdate.some((userToUpdate) =>
        userToUpdate.newPerkNames.some(
          (perkName) =>
            !Object.keys(userToUpdate.oldPerkUsesDict).includes(perkName)
        )
      )
    ) {
      logger.error(
        'oldPerkUsesDict is not a superset of newPerkNames when shrinking live users'
      );
    }

    applyChanges.push(...usersToDelete.map(deleteUserHelper));
  }

  await Promise.all(applyChanges);
};
