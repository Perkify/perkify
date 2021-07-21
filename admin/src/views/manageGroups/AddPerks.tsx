import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { AuthContext } from "contexts/Auth";
import React, { useContext, useState } from "react";
import { PerkifyApi } from "services";
import { allPerks } from "../../constants";

const AddPerks = ({
  isAddPerksModalVisible,
  setIsAddPerksModalVisible,
  selectedPerks,
  group,
  emails,
}) => {
  const [perksToAdd, setPerksToAdd] = useState([]);
  const [selectedPerksError, setSelectedPerksError] = useState("");
  const [availablePerks, setAvailablePerks] = useState(
    allPerks.map((perkObj) => perkObj.Name)
  );
  const { currentUser } = useContext(AuthContext);

  const addPerksToPerkGroup = (event) => {
    event.preventDefault();
    let error = false;
    if (perksToAdd.length == 0) {
      setSelectedPerksError("Select perks");
      error = true;
    }

    if (!error) {
      setIsAddPerksModalVisible(false);

      (async () => {
        const bearerToken = await currentUser.getIdToken();

        const afterPerks = perksToAdd.concat(
          selectedPerks.map((perkObj) => perkObj.Name)
        );
        console.log(afterPerks);

        await PerkifyApi.put(
          "user/auth/updatePerkGroup",
          JSON.stringify({
            group,
            emails: emails.map((emailObj) => emailObj.email),
            perks: afterPerks,
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
      open={isAddPerksModalVisible}
      onClose={() => setIsAddPerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Perks</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add users to this organization, please enter their email addresses
          below and select a group from the dropdown.
        </DialogContentText>
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
          value={perksToAdd}
          multiple
          fullWidth
          label="Select Group"
          placeholder="Select Gruop"
          onChange={(event) => {
            setPerksToAdd(event.target.value as string[]);
          }}
          error={selectedPerksError != ""}
        >
          {availablePerks.map((name) => (
            <MenuItem value={name} key={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setIsAddPerksModalVisible(false)}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={addPerksToPerkGroup} color="primary">
          Add Perks
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPerks;