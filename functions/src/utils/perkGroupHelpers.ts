export const generatePerkGroupIntersection = (
  perkGroup1: PerkGroup,
  perkGroup2: PerkGroup
) =>
  ({
    perkNames: perkGroup1.perkNames.filter((perkName) =>
      perkGroup2.perkNames.includes(perkName)
    ),
    emails: perkGroup1.emails.filter((email) =>
      perkGroup2.emails.includes(email)
    ),
  } as PerkGroup);

// it's not really a diff, because it is assymetrical. It's a patch!
export const generateEmailsPatch = (
  updatedEmails: string[],
  liveEmails: string[]
) => {
  const emailsToCreate: string[] = [];
  const emailsToUpdate: string[] = [];
  const emailsToDelete: string[] = [];

  liveEmails.forEach((email) => {
    if (!updatedEmails.includes(email)) {
      // user does exist but is not in the businessData doc
      // delete the user
      emailsToDelete.push(email);
    }
  });

  updatedEmails.map((email) => {
    // check if user exists
    if (liveEmails.includes(email)) {
      // user exists
      emailsToUpdate.push(email);
    } else {
      // user does not exist
      emailsToCreate.push(email);
    }
  });

  return { emailsToCreate, emailsToUpdate, emailsToDelete };
};
