export const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateEmails = (emailString: string) => {
  let emails = emailString.replace(/[,'"]+/gi, ' ').split(/\s+/);
  let retValue = true;
  emails.forEach((email) => {
    if (validateEmail(email) === false) {
      retValue = false;
    }
  });
  return retValue;
};
