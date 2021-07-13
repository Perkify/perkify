import {
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Header from "components/Header";
import ClippedDrawer from "components/VerticalNav";
import { AuthContext } from "contexts/Auth";
import React, { useContext, useState } from "react";
import { validateEmails } from "utils/emailValidation";
import { allPerks, allPerksDict } from "../../constants";

const fillerGroupData = [
  {
    name: "A",
    id: "abc123",
  },
  {
    name: "B",
    id: "abc133",
  },
];

const CreateGroup = ({ history }) => {
  const [availablePerks, setAvailablePerks] = useState(
    allPerks.map((perkObj) => perkObj.Name)
  );
  const [numPeople, setNumPeople] = useState(0);
  const [costPerPerson, setCostPerPerson] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const { currentUser } = useContext(AuthContext);

  const [groupName, setGroupName] = useState("");
  const [emails, setEmails] = useState("");
  const [selectedPerks, setSelectedPerks] = useState([]);

  const [groupNameError, setGroupNameError] = useState("");
  const [emailsError, setEmailsError] = useState("");
  const [selectedPerksError, setSelectedPerksError] = useState("");

  const handlePerkChange = (event) => {
    // update the controlled form
    const perks = event.target.value as string[];

    setSelectedPerksError("");

    setSelectedPerks(perks);

    let cost = 0;
    perks.forEach((perk) => {
      cost += allPerksDict[perk]["Cost"];
    });
    setCostPerPerson(cost);
    setTotalCost(cost * numPeople);
  };

  const handleEmailError = (event) => {
    setEmails(event.target.value);
    if (event.target.value === "") {
      setEmailsError("Please input atleast one email");
    } else if (!validateEmails(event.target.value)) {
      setEmailsError("Please input proper emails");
    } else {
      setEmailsError("");
    }
  };

  const handleEmailChange = (event) => {
    handleEmailError(event);
    let tmpNumPeople = numPeople;
    if (event.target.value === "") {
      // if empty, set num people to 0
      tmpNumPeople = 0;
    } else if (!validateEmails(event.target.value)) {
      // if error, leave it the same as it was before
      // user is typing
    } else {
      // if not error, update the number of people
      const emails = event.target.value.replace(/[,'"]+/gi, " ").split(/\s+/);
      tmpNumPeople = emails.length;
    }
    // update the number of people and total cost
    setNumPeople(tmpNumPeople);
    setTotalCost(tmpNumPeople * costPerPerson);
  };

  const handleAddUsers = async (event) => {
    const emailList = emails.replace(/[,'"]+/gi, " ").split(/\s+/); //Gives email as a list

    const bearerToken = await currentUser.getIdToken();
    // call the api to create the group
    const response = await fetch(
      "https://us-central1-perkify-5790b.cloudfunctions.net/user/auth/createGroup",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group: groupName,
          emails: emailList,
          perks: selectedPerks,
        }),
      }
    );
    history.push("../people");
  };

  const createPerkGroup = (e) => {
    e.preventDefault();
    let error = false;
    if (groupName == "") {
      setGroupNameError("Enter a group name");
      error = true;
    }
    if (emails == "") {
      setEmailsError("Enter emails");
      error = true;
    }
    if (selectedPerks.length == 0) {
      setSelectedPerksError("Select perks");
      error = true;
    }
  };

  function handleClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
  }

  return (
    <ClippedDrawer>
      <Header
        title="Create Gruop"
        crumbs={["Dashboard", "Perk Groups", "Create Gruop"]}
      />

      <Paper
        style={{ width: 700, padding: 30, marginTop: 30 }}
        variant="outlined"
      >
        {/* <Typography variant="body2" color="textSecondary" component="p">
            Create a perk group
          </Typography> */}
        <Typography style={{ marginBottom: "15px" }}>Group Name</Typography>
        <TextField
          id="group_name"
          variant="outlined"
          label="Group Name"
          placeholder="Cole's Group"
          value={groupName}
          onChange={(event) => {
            setGroupName(event.target.value);
            setGroupNameError("");
          }}
          fullWidth
          error={groupNameError != ""}
          helperText={groupNameError}
        />
        <Typography style={{ marginTop: "30px", marginBottom: "15px" }}>
          Emails
        </Typography>
        <TextField
          id="emailaddresses"
          variant="outlined"
          label=""
          placeholder="Insert emails separated by commas or newlines"
          value={emails}
          onChange={handleEmailChange}
          fullWidth
          multiline
          rows={4}
          rowsMax={4}
          error={emailsError != ""}
          helperText={emailsError}
        />
        <Typography style={{ marginTop: "30px", marginBottom: "15px" }}>
          Perks
        </Typography>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          displayEmpty
          renderValue={(selected) => {
            if ((selected as string[]).length === 0) {
              return "Select Perks";
            }

            return (selected as string[]).join(", ");
          }}
          variant="outlined"
          value={selectedPerks}
          multiple
          fullWidth
          label="Select Group"
          placeholder="Select Gruop"
          onChange={handlePerkChange}
          error={selectedPerksError != ""}
        >
          {availablePerks.map((name) => (
            <MenuItem value={name} key={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
        {/* {selectedGroupError != "" && (
          <FormHelperText>{selectedGroupError}</FormHelperText>
        )} */}

        <Typography style={{ marginTop: "30px", marginBottom: "15px" }}>
          Estimated Cost: ${totalCost}
        </Typography>
        <Button
          onClick={createPerkGroup}
          variant="contained"
          color="primary"
          fullWidth
        >
          Create Perk Group
        </Button>
      </Paper>
    </ClippedDrawer>
  );
};

export default CreateGroup;
