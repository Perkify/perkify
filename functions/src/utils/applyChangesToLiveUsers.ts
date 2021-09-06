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
  const existingEmployeesSnapshot = await db
    .collection('businesses')
    .doc(updatedBusiness.businessID)
    .collection('employees')
    .get();

  const existingEmployeesDict = generateDictFromSnapshot(
    existingEmployeesSnapshot
  ) as Record<string, Employee>;

  // get a list of the perk groups we would be expanding to
  const expandingToPerkGroupIDs = Object.keys(updatedBusiness.perkGroups);

  // get a list of all the perk group names we would be shrinking from
  const shrinkingFromPerkGroupIDs = Array.from(
    new Set(
      Object.keys(existingEmployeesDict).map(
        (userID) => existingEmployeesDict[userID].perkGroupID
      )
    )
  ).filter((perkGroupID) => perkGroupID != null);

  // pick the important list of perk group names
  const importantPerkGroupIDs =
    modificationType === 'expand'
      ? expandingToPerkGroupIDs
      : shrinkingFromPerkGroupIDs;

  // process each perk group separately
  await Promise.all(
    importantPerkGroupIDs.map(async (perkGroupID) => {
      // TODOFUTURE: improve this so that we can instantly tell if a perkGroup has changed
      // if it hasn't, skip a loop to avoid fetching firestore documents and speed things up

      const livePerkEmployeeDocs = existingEmployeesSnapshot.docs.filter(
        (userDoc) => (userDoc.data() as Employee).perkGroupID === perkGroupID
      );

      const pendingPerkGroup =
        pendingBusiness.perkGroups[perkGroupID] ||
        ({ perkNames: [], employeeIDs: [], perkGroupName: '' } as PerkGroup);

      const payloadPerkGroup =
        updatedBusiness.perkGroups[perkGroupID] ||
        ({ perkNames: [], employeeIDs: [], perkGroupName: '' } as PerkGroup);

      const livePerkGroup =
        livePerkEmployeeDocs.length != 0
          ? ({
              perkNames: Object.keys(
                (livePerkEmployeeDocs[0].data() as Employee).perkUsesDict
              ),
              employeeIDs: livePerkEmployeeDocs.map((userDoc) => userDoc.id),
            } as PerkGroup)
          : ({
              perkNames: [],
              employeeIDs: [],
              perkGroupName: '',
            } as PerkGroup);

      // EXPAND
      // get the intersection of the payloadPerkGroup and the pendingPerkGroup
      // livePerkGroup a subset of both the pendingPerkGroup and the payloadPerkGroup
      // so the intersection is a superset of the intersection of livePerkGroup
      // therefore we are only going to be expanding the live users
      // when we put the intersection on the live users

      // SHRINK
      // intersect payloadPerkGroup with livePerkGroup
      // to get a subset of the livePerkGroup
      // that we will apply to livePerkGroup
      // in order to shrink it

      const intersectedPerkGroupData = generatePerkGroupIntersection(
        payloadPerkGroup,
        modificationType === 'expand' ? pendingPerkGroup : livePerkGroup
      );

      // get the emails patch
      const { employeesToCreate, employeesToUpdate, employeesToDelete } =
        generateEmailsPatch(
          intersectedPerkGroupData.employeeIDs,
          livePerkGroup.employeeIDs
        );

      usersToCreate.push(
        ...employeesToCreate.map((employeeID) => ({
          employeeID,
          newPerkNames: intersectedPerkGroupData.perkNames,
          perkGroupID,
          businessID,
          email: existingEmployeesDict[employeeID].email,
        }))
      );

      usersToUpdate.push(
        ...employeesToUpdate.map((employeeID) => ({
          employeeID,
          businessID,
          newPerkNames: intersectedPerkGroupData.perkNames,
          oldPerkUsesDict: existingEmployeesDict[employeeID].perkUsesDict,
          perkGroupID,
        }))
      );

      usersToDelete.push(
        ...employeesToDelete.map((employeeID) => ({
          businessID,
          employeeID,
          card: existingEmployeesDict[employeeID].card,
        }))
      );

      console.log(
        intersectedPerkGroupData.employeeIDs,
        livePerkGroup.employeeIDs,
        employeesToDelete,
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
