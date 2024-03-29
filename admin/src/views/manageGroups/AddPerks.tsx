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
} from '@material-ui/core';
import axios from 'axios';
import PurchaseConfirmation from 'components/PurchaseConfirmation';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import React, { useContext, useState } from 'react';
import { PerkifyApi } from 'services';
import { allPerks, allPerksDict } from 'shared';
import { convertPeriodToInterval } from 'utils/periodConversions';

interface AddPerksProps {
  isAddPerksModalVisible: boolean;
  setIsAddPerksModalVisible: (arg0: boolean) => void;
  group: string;
  groupPerks: PerkDefinition[];
  emails: { email: string; group: string; id: string; employeeID: string }[];
}

const AddPerks = ({
  isAddPerksModalVisible,
  setIsAddPerksModalVisible,
  groupPerks,
  group,
  emails,
}: AddPerksProps) => {
  const [perksToAdd, setPerksToAdd] = useState([]);
  const [groupPerksError, setSelectedPerksError] = useState('');
  const [availablePerks, setAvailablePerks] = useState([]);
  const [isConfirmationModalVisible, setConfirmationModalVisible] =
    useState(false);

  const { currentUser } = useContext(AuthContext);
  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);
  const { business } = useContext(BusinessContext);

  React.useEffect(() => {
    setAvailablePerks(
      allPerks
        .map((perkObj) => perkObj.Name)
        .filter((perk) => {
          return !groupPerks.some((perkObj) => perkObj.Name == perk);
        })
    );
  }, [groupPerks]);

  const addPerksToPerkGroup = (event: any) => {
    event.preventDefault();
    let error = false;
    if (perksToAdd.length == 0) {
      setSelectedPerksError('Select perks');
      error = true;
    }

    if (!error) {
      (async () => {
        setConfirmationModalVisible(false);
        setIsAddPerksModalVisible(false);
        setDashboardLoading(true);
        setFreezeNav(true);
        const bearerToken = await currentUser.getIdToken();

        const afterPerks = perksToAdd.concat(
          groupPerks.map((perkObj) => perkObj.Name)
        );

        try {
          const payload: UpdatePerkGroupPayload = {
            employeeIDs: emails.map((emailObj) => emailObj.employeeID),
            perkNames: afterPerks,
            perkGroupName: business.perkGroups[group].perkGroupName,
          };
          await PerkifyApi.put(`rest/perkGroup/${group}`, payload, {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          });

          setFreezeNav(false);
          setDashboardLoading(false);
          setPerksToAdd([]);
        } catch (err) {
          setDashboardLoading(false);
          setFreezeNav(false);
          if (axios.isAxiosError(err)) {
            alert(
              `Error. Reason: ${err.response.data.reason}. Details: ${err.response.data.reasonDetail}`
            );
          } else {
            alert('Error. Reason unknown. Pleaser');
          }
        }
      })();
    }
  };

  function setVisible() {
    let error = false;
    if (perksToAdd.length == 0) {
      setSelectedPerksError('Select perks');
      error = true;
    }
    if (error) {
      return;
    }
    setConfirmationModalVisible(true);
  }

  return isConfirmationModalVisible ? (
    <PurchaseConfirmation
      isAddPerksModalVisible={isAddPerksModalVisible}
      setIsAddPerksModalVisible={setIsAddPerksModalVisible}
      title={'Add Perks'}
      text={'Are you sure you want to add these perks for a total cost of $'}
      onConfirmation={addPerksToPerkGroup}
      setConfirmationModalVisible={setConfirmationModalVisible}
      perks={perksToAdd}
      numPeople={emails.length}
      creatingGroup={false}
    />
  ) : (
    <Dialog
      open={isAddPerksModalVisible}
      onClose={() => setIsAddPerksModalVisible(false)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Perks</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To add perks to this group, please select them from the dropbox below.
        </DialogContentText>
        <Typography style={{ marginTop: '30px', marginBottom: '15px' }}>
          Perks
        </Typography>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          displayEmpty
          renderValue={(selected) => {
            if ((selected as string[]).length === 0) {
              return 'Select Perks';
            }

            return (selected as string[]).join(', ');
          }}
          variant="outlined"
          value={perksToAdd}
          multiple
          fullWidth
          onChange={(event) => {
            setPerksToAdd(event.target.value as string[]);
          }}
          error={groupPerksError != ''}
        >
          {availablePerks.map((name) => (
            <MenuItem value={name} key={name}>
              {name +
                ' ($' +
                allPerksDict[name].Cost.toFixed(2) +
                ' / ' +
                convertPeriodToInterval(allPerksDict[name].Period) +
                ')'}
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
        <Button onClick={setVisible} color="primary">
          Add Perks
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPerks;
