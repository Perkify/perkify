import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { AuthContext } from 'contexts';
import React, { useContext } from 'react';

const RemovePerks = ({
  isRemovePerksModalVisible,
  setIsRemovePerksModalVisible,
  selectedPerks,
  setSelectedPerks,
  groupPerks,
  group,
  emails,
}) => {
  const { currentUser } = useContext(AuthContext);

  const removePerksFromPerkGroup = (event) => {
    let error = false;

    event.preventDefault();
    if (!error) {
      (async () => {
        const bearerToken = await currentUser.getIdToken();

        // get all perks that are not selected
        // by removing all perks that were selected
        const afterPerks = groupPerks.filter(
          (perkObj, index) => selectedPerks.indexOf(index) == -1
        );
        console.log(groupPerks);
        console.log(afterPerks);
        const afterPerksNames = afterPerks.map((perkObj) => perkObj.Name);
        console.log(afterPerksNames);
        // await PerkifyApi.put(
        //   'user/auth/updatePerkGroup',
        //   JSON.stringify({
        //     group,
        //     emails: emails.map((emailObj) => emailObj.email),
        //     perks: afterPerksNames,
        //   }),
        //   {
        //     headers: {
        //       Authorization: `Bearer ${bearerToken}`,
        //       'Content-Type': 'application/json',
        //     },
        //   }
        // );
        setIsRemovePerksModalVisible(false);
        setSelectedPerks([]);
      })();
    }
  };

  return (
    <Dialog
      open={isRemovePerksModalVisible}
      onClose={() => setIsRemovePerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Delete Users</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to remove these perks?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setIsRemovePerksModalVisible(false)}
          color="primary"
        >
          No
        </Button>
        <Button onClick={removePerksFromPerkGroup} color="primary">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemovePerks;
