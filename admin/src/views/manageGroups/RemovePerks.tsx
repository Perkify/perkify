import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import React from 'react';
import { AuthContext } from 'contexts/Auth';
import { useContext, useState } from 'react';
import { PerkifyApi } from 'services';

const RemovePerks = ({
  isRemovePerksModalVisible,
  setIsRemovePerksModalVisible,
  groupPerks, 
  selectedPerks,
  setSelectedPerks,
  group,
  emails
}) => {

  const { currentUser } = useContext(AuthContext);


  const removePerksToPerkGroup = (event) => {
    let error = false;

    event.preventDefault();
    if (!error) {
      setIsRemovePerksModalVisible(false);

      (async () => {
        const bearerToken = await currentUser.getIdToken();

        console.log(groupPerks)
        console.log(selectedPerks)
        const afterPerks = groupPerks.filter(perk => {
          console.log(perk)
          let retVal = true
          selectedPerks.forEach(perkObj => {
            console.log(perkObj)
            if (perkObj === perk.id){
              console.log("hello")
              retVal = false
            }
          });
          return retVal
        })
        let afterPerksList = []
        afterPerks.forEach(perkObj => {
          console.log(perkObj)
          afterPerksList.push(perkObj.Name)
        });
        console.log(afterPerksList);
        setSelectedPerks([])

        await PerkifyApi.put(
          'user/auth/updatePerkGroup',
          JSON.stringify({
            group,
            emails: emails.map((emailObj) => emailObj.email),
            perks: afterPerksList,
          }),
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
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
        <Button
          onClick={
            removePerksToPerkGroup}
          color="primary"
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemovePerks;
