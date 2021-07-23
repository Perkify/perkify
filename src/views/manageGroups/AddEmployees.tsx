import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@material-ui/core";
import { AuthContext } from "contexts/Auth";
import React, { useContext, useState } from "react";
import { PerkifyApi } from "services";
import { validateEmails } from "utils/emailValidation";

const AddEmployees = ({
  isAddEmployeesModalVisible,
  setIsAddEmployeesModalVisible,
  employees,
  group,
  selectedPerks,
}) => {
  const [emailsToAdd, setEmailsToAdd] = useState("");
  const [emailsError, setEmailsError] = useState("");

  const { currentUser } = useContext(AuthContext);
  const handleEmailError = (event) => {
    setEmailsToAdd(event.target.value);
    if (event.target.value === "") {
      setEmailsError("Please input atleast one email");
    } else if (!validateEmails(event.target.value)) {
      setEmailsError("Please input proper emails");
    } else {
      setEmailsError("");
    }
  };

  const addEmployeesToPerkGroup = (event) => {
    event.preventDefault();
    let error = false;
    if (emailsToAdd == "") {
      setEmailsError("Enter emails");
      error = true;
    }
    if (!error) {
      setIsAddEmployeesModalVisible(false);
      (async () => {
        const bearerToken = await currentUser.getIdToken();

        const emailList = emailsToAdd.replace(/[,'"]+/gi, " ").split(/\s+/); //Gives email as a list

        const afterEmployees = emailList.concat(
          employees.map((employeeObj) => employeeObj.email)
        );

        console.log(afterEmployees);

        await PerkifyApi.put(
          "user/auth/updatePerkGroup",
          JSON.stringify({
            group,
            perks: selectedPerks.map((perkObj) => perkObj.Name),
            emails: afterEmployees,
          }),
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      })();
    }
  };

  return (
    <Dialog
      open={isAddEmployeesModalVisible}
      onClose={() => setIsAddEmployeesModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Users</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add users to this perk group, please enter their email addresses
          below.
        </DialogContentText>
        <Typography style={{ marginTop: "30px", marginBottom: "15px" }}>
          Emails
        </Typography>
        <TextField
          id="emailaddresses"
          variant="outlined"
          label=""
          placeholder="Insert emails separated by commas or newlines"
          value={emailsToAdd}
          onChange={handleEmailError}
          fullWidth
          multiline
          rows={4}
          rowsMax={4}
          error={emailsError != ""}
          helperText={emailsError}
        />
        <DialogActions>
          <Button
            onClick={() => setIsAddEmployeesModalVisible(false)}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={addEmployeesToPerkGroup} color="primary">
            Add Users
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployees;
