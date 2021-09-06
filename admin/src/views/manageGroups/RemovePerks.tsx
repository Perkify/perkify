import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { GridSelectionModel } from '@material-ui/data-grid';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext } from 'react';
import { PerkifyApi } from 'services';

interface RemovePerksProps {
  isRemovePerksModalVisible: boolean;
  setIsRemovePerksModalVisible: (arg0: boolean) => void;

  selectedPerks: GridSelectionModel;
  setSelectedPerks: (model: GridSelectionModel) => void;

  groupPerks: PerkDefinition[];
  group: string;
  emails: { email: string; group: string; id: string; employeeID: string }[];
}

const RemovePerks = ({
  isRemovePerksModalVisible,
  setIsRemovePerksModalVisible,
  selectedPerks,
  setSelectedPerks,
  groupPerks,
  group,
  emails,
}: RemovePerksProps) => {
  const { currentUser } = useContext(AuthContext);

  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const { business } = useContext(BusinessContext);
  const removePerksFromPerkGroup = (event: any) => {
    let error = false;

    event.preventDefault();
    if (!error) {
      (async () => {
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();

        // get all perks that are not selected
        // by removing all perks that were selected
        const afterPerks = groupPerks.filter(
          (perkObj, index) => selectedPerks.indexOf(index) == -1
        );
        const afterPerksNames = afterPerks.map((perkObj) => perkObj.Name);
        if (afterPerksNames.length == 0) {
          alert('Error: cannot remove all perks from a perk group');
          setDashboardLoading(false);
          setFreezeNav(false);
          setIsRemovePerksModalVisible(false);
          setSelectedPerks([]);
          return;
        }
        const payload: UpdatePerkGroupPayload = {
          employeeIDs: emails.map((emailObj) => emailObj.employeeID),
          perkNames: afterPerksNames,
          perkGroupName: Object.keys(business.perkGroups).find(
            (perkGroupID) =>
              business.perkGroups[perkGroupID].perkGroupName == group
          ),
        };
        await PerkifyApi.put(`rest/perkGroup/${group}`, payload, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        });
        setDashboardLoading(false);
        setFreezeNav(false);
        setIsRemovePerksModalVisible(false);
      })();
    }
  };

  return (
    <Dialog
      open={isRemovePerksModalVisible}
      onClose={() => setIsRemovePerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Delete Perks</DialogTitle>
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
