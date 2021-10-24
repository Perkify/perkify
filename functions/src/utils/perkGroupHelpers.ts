export const generatePerkGroupIntersection = (
  perkGroup1: PerkGroup,
  perkGroup2: PerkGroup
) =>
  ({
    perkNames: perkGroup1.perkNames.filter((perkName) =>
      perkGroup2.perkNames.includes(perkName)
    ),
    employeeIDs: perkGroup1.employeeIDs.filter((employeeID) =>
      perkGroup2.employeeIDs.includes(employeeID)
    ),
  } as PerkGroup);

// it's not really a diff, because it is assymetrical. It's a patch!
export const generateEmailsPatch = (
  updatedEmployeeIDs: string[],
  liveEmployeeIDs: string[]
) => {
  const employeesToCreate: string[] = [];
  const employeesToUpdate: string[] = [];
  const employeesToDelete: string[] = [];

  liveEmployeeIDs.forEach((employeeID) => {
    if (!updatedEmployeeIDs.includes(employeeID)) {
      // user does exist but is not in the businessData doc
      // delete the user
      employeesToDelete.push(employeeID);
    }
  });

  updatedEmployeeIDs.map((email) => {
    // check if user exists
    if (liveEmployeeIDs.includes(email)) {
      // user exists
      employeesToUpdate.push(email);
    } else {
      // user does not exist
      employeesToCreate.push(email);
    }
  });

  return {
    employeesToCreate: employeesToCreate,
    employeesToUpdate: employeesToUpdate,
    employeesToDelete: employeesToDelete,
  };
};
