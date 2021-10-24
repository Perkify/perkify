export const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateEmails = (emailString: string) => {
  const emails = emailString
    .trim()
    .replace(/[,'"]+/gi, ' ')
    .split(/\s+/);
  // check that every email in the list is valid
  const retValue = emails.every((email) => validateEmail(email));
  return retValue;
};
