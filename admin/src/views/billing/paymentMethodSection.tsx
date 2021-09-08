import {
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { createStyles, makeStyles } from '@material-ui/styles';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import firebase from 'firebase/app';
import React, { useContext, useState } from 'react';
import { PerkifyApi } from 'services';
import AddPaymentMethodModal from './addPaymentMethodModal';
import RemovePaymentMethodModal from './removePaymentMethodModal';
import { SectionHeading } from './sectionHeading';

const useDisplayCardPaymentMethodsStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      '& > *': {
        // flex: 1,
        '&:not(:first-child)': {
          marginLeft: '10px',
        },
      },
    },
    title: {
      flex: '1 1 auto',
      marginLeft: '10px',
    },
    listContainer: {
      '& > *': {
        '&:not(:first-child)': {
          marginTop: '20px',
        },
      },
    },
  })
);

const cardPaymentIconPath = (brand: string) => {
  //  amex, diners, discover, jcb, mastercard, unionpay, visa, or unknown
  switch (brand) {
    case 'amex':
      return '/credit-card-payment-icons/amex.svg';
    case 'diners':
      return '/credit-card-payment-icons/diners.svg';
    case 'discover':
      return '/credit-card-payment-icons/discover.svg';
    case 'jcb':
      return '/credit-card-payment-icons/jcb.svg';
    case 'mastercard':
      return '/credit-card-payment-icons/mastercard.svg';
    case 'unionpay':
      return '/credit-card-payment-icons/unionpay.svg';
    case 'visa':
      return '/credit-card-payment-icons/visa.svg';
    case 'unknown':
      return '/credit-card-payment-icons/unknown.svg';
    default:
      break;
  }
};

const DisplayCardPaymentMethod = ({
  card,
  business,
  currentUser,
  setPaymentMethodIDToRemove,
}: {
  card: SimpleCardPaymentMethod;
  business: Business;
  currentUser: firebase.User | null;
  setPaymentMethodIDToRemove: (arg0: string) => void;
}) => {
  const classes = useDisplayCardPaymentMethodsStyles();
  const { setDashboardLoading } = useContext(LoadingContext);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const setPaymentMethodAsDefault = (paymentMethodID: string) => {
    (async () => {
      setDashboardLoading(true);
      const bearerToken = await currentUser.getIdToken();

      const result = (
        await PerkifyApi.put(
          `rest/business/${business.businessID}/defaultPaymentMethod/${paymentMethodID}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      ).data;

      if (result.error) {
        // Display result.error.message in your UI.
      } else {
        console.log('Success');
      }

      setDashboardLoading(false);
    })();
  };

  return (
    <Grid container>
      <Grid item xs={4}>
        <div className={classes.root}>
          <img style={{ height: 25 }} src={cardPaymentIconPath(card.brand)} />
          <Typography variant="body1">&bull;&bull;&bull;&bull;</Typography>
          <Typography variant="body1">{card.last4}</Typography>
          {card.default && <Chip label="Default" style={{ height: 20 }} />}
        </div>
      </Grid>

      <Grid item xs={3}>
        <div className={classes.root}>
          <Typography variant="body1">{`Expires ${card.expMonth
            .toString()
            .padStart(2, '0')}/${card.expYear}`}</Typography>
          {card.default ? (
            <Tooltip
              disableFocusListener={
                !business ||
                Object.keys(business.cardPaymentMethods).length > 1 ||
                Object.keys(business.perkGroups).length == 0
              }
              disableHoverListener={
                !business ||
                Object.keys(business.cardPaymentMethods).length > 1 ||
                Object.keys(business.perkGroups).length == 0
              }
              title="If you'd like to change your default payment method, please add another payment method before removing this one. If you'd like to cancel your Perkify subscription, please delete all your perk groups first."
              placement="bottom-start"
            >
              <div style={{ flex: 1 }}>
                <IconButton
                  aria-label="clear"
                  style={{
                    backgroundColor: 'transparent',
                    marginLeft: 'auto',
                    flex: 1,
                    margin: 0,
                    padding: 0,
                    float: 'right',
                  }}
                  disableRipple
                  // can't clear a card unless you have another one to fall back on
                  disabled={
                    Object.keys(business.cardPaymentMethods).length <= 1 &&
                    Object.keys(business.perkGroups).length != 0
                  }
                  onClick={() =>
                    setPaymentMethodIDToRemove(card.paymentMethodID)
                  }
                >
                  <ClearIcon fontSize="small" style={{ marginLeft: 'auto' }} />
                </IconButton>
              </div>
            </Tooltip>
          ) : (
            <>
              <IconButton
                aria-label="options"
                style={{
                  margin: 0,
                  padding: 0,
                  flex: 1,
                  backgroundColor: 'transparent',
                }}
                disableRipple
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setAnchorEl(event.currentTarget);
                }}
              >
                <MoreHorizIcon
                  fontSize="small"
                  style={{ marginLeft: 'auto' }}
                />
              </IconButton>
              <Menu
                id={`${card.fingerprint} simple menu`}
                open={Boolean(anchorEl)}
                keepMounted
                anchorEl={anchorEl}
                onClose={(
                  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                ) => {
                  event.stopPropagation();
                  event.preventDefault();
                  setAnchorEl(null);
                }}
                elevation={4}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'center',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
              >
                <MenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setAnchorEl(null);
                    setPaymentMethodAsDefault(card.paymentMethodID);
                  }}
                >
                  Make default
                </MenuItem>

                <MenuItem
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setAnchorEl(null);
                    setPaymentMethodIDToRemove(card.paymentMethodID);
                  }}
                  style={{ color: 'red' }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

const usePaymentMethodsSectionStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
      '& > *': {
        // flex: 1,
        '&:not(:first-child)': {
          marginLeft: '10px',
        },
      },
    },
    title: {
      flex: '1 1 auto',
      marginLeft: '10px',
    },
    listContainer: {
      '& > *': {
        '&:not(:first-child)': {
          marginTop: '20px',
        },
      },
    },
  })
);

export const PaymentMethodsSection = () => {
  const classes = usePaymentMethodsSectionStyles();
  const [addingPaymentMethod, setAddingPaymentMethod] = useState(false);
  const [paymentMethodIDToRemove, setPaymentMethodIDToRemove] = useState(null);

  const { business } = useContext(BusinessContext);
  const { currentUser } = useContext(AuthContext);

  return (
    <SectionHeading title="PAYMENT METHOD">
      <div className={classes.listContainer}>
        {business &&
          Object.values(business.cardPaymentMethods)
            // sort the payment methods so that the default payment method goes first
            .sort((a, b) => (a.default ? -1 : 1))
            .map((card) => (
              <DisplayCardPaymentMethod
                card={card}
                business={business}
                currentUser={currentUser}
                setPaymentMethodIDToRemove={(paymentID) =>
                  setPaymentMethodIDToRemove(paymentID)
                }
              />
            ))}
        <div>
          <Button
            variant="text"
            disableRipple
            onClick={() => setAddingPaymentMethod(true)}
            style={{
              padding: 0,
              margin: '0',
              textTransform: 'none',
              backgroundColor: 'transparent',
            }}
          >
            <Typography
              variant="body1"
              style={{ color: 'grey', display: 'flex', alignItems: 'center' }}
            >
              <AddIcon fontSize="small" style={{ marginRight: '5px' }} />
              Add Payment Method
            </Typography>
          </Button>
        </div>
        <AddPaymentMethodModal
          isModalVisible={addingPaymentMethod}
          setIsModalVisible={setAddingPaymentMethod}
        />
        <RemovePaymentMethodModal
          paymentMethodIDToRemove={paymentMethodIDToRemove}
          setPaymentMethodIDToRemove={setPaymentMethodIDToRemove}
        />
      </div>
    </SectionHeading>
  );
};
