import { IconButton, Menu, MenuItem, Paper } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GroupIcon from '@material-ui/icons/Group';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import ConfirmationModal from 'components/ConfirmationModal';
import { AuthContext, BusinessContext, LoadingContext } from 'contexts';
import logo from 'images/logo.png';
import React, { MouseEvent, useContext, useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { PerkifyApi } from 'services';

const drawerWidth = 280;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
      [theme.breakpoints.up('md')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    drawerContainer: {
      overflow: 'auto',
    },
    avatarCard: {
      display: 'flex',

      '& > *': {
        margin: theme.spacing(1),
      },
      margin: '20px 25px',
      padding: '0px 10px',
      border: 0,
      backgroundColor: '#e6edff',
      height: '80px',
      alignItems: 'center',
    },
    content: {
      flexGrow: 1,
      minWidth: '200px',
      padding: theme.spacing(3),
    },
    listItem: {
      fontSize: 14,
    },
  })
);

interface ClippedDrawerProps {
  children: React.ReactNode;
}

export default function ClippedDrawer({ children }: ClippedDrawerProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const history = useHistory();

  const [isDeletePerkGroupModalVisible, setIsDeletePerkGroupModalVisible] =
    useState('');

  const { currentUser } = useContext(AuthContext);
  const { business } = useContext(BusinessContext);

  const { dashboardLoading, setDashboardLoading, freezeNav, setFreezeNav } =
    useContext(LoadingContext);

  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const deletePerkGroup = async () => {
    const bearerToken = await currentUser.getIdToken();
    setDashboardLoading(true);
    setFreezeNav(true);

    await PerkifyApi.delete(`rest/perkGroup/${isDeletePerkGroupModalVisible}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    setDashboardLoading(false);
    setFreezeNav(false);
    setIsDeletePerkGroupModalVisible('');
    history.push('/dashboard');
  };

  const generalNav: [string, string, any][] = [
    ['Dashboard', '/dashboard', <DashboardIcon />],
  ];

  const peopleNav: [string, string, any][] = [
    ['Employees', '/dashboard/people', <PersonIcon />],
  ];

  let [groupViews, setGroupViews]: [[string, string, any][], Function] =
    useState([]);

  useEffect(() => {
    if (business) {
      const tmpGroupViews = Object.keys(business.perkGroups)
        .sort()
        .map((group) => [group, '/dashboard/group/' + group, <GroupIcon />]);

      tmpGroupViews.push([
        'Add New Group',
        '/dashboard/create/group',
        <AddIcon />,
      ]);
      setGroupViews(tmpGroupViews);
    }
  }, [business]);

  const infoNav: [string, string, any][] = groupViews;

  const accountNav: [string, string, any][] = [
    ['Billing', '/dashboard/billing', <SettingsIcon />],
    ['Logout', '/dashboard/logout', <ExitToAppIcon />],
  ];

  const navSections: [string, [string, string, any][]][] =
    business && business.cardPaymentMethods.length != 0
      ? [
          ['General', generalNav],
          ['People', peopleNav],
          ['Perk Groups', infoNav],
          ['Account', accountNav],
        ]
      : business && business.cardPaymentMethods.length == 0
      ? [
          ['General', generalNav],
          ['People', peopleNav],
          ['Account', accountNav],
        ]
      : [
          ['General', generalNav],
          ['Account', accountNav],
        ];

  const drawer = (
    <div>
      {/* <Toolbar /> */}
      <div className={classes.drawerContainer}>
        <div style={{ padding: '40px 30px' }}>
          <img style={{ height: '30px' }} src={logo} />
        </div>
        <Paper className={classes.avatarCard} variant="outlined">
          <Avatar
            alt={currentUser?.displayName}
            src="brokenimage"
            style={{ backgroundColor: theme.palette.primary.main }}
          />
          <span>
            <Typography style={{ fontSize: '14px' }}>
              <Box fontWeight="bold">{currentUser?.displayName}</Box>
            </Typography>
            <Typography variant="caption">admin</Typography>
          </span>
        </Paper>
        <div style={{ padding: '10px 0' }}>
          {navSections.map(([sectionName, section], index) => (
            <div key={sectionName}>
              <Typography
                style={{
                  margin: '30px 0 0 40px',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
                component="div"
              >
                <Box fontWeight={700}>{sectionName}</Box>
              </Typography>
              <List>
                {section.map(([name, route, e], index) => (
                  <ListItem
                    button
                    component={Link}
                    to={route}
                    key={name}
                    style={{
                      backgroundColor: location.pathname == route && '#e6edff',
                      color:
                        location.pathname == route &&
                        theme.palette.primary.main,
                      borderRight: `3px solid ${
                        location.pathname == route
                          ? theme.palette.primary.main
                          : 'transparent'
                      }`,
                      paddingLeft: '30px',
                    }}
                  >
                    <ListItemIcon
                      style={{
                        justifyContent: 'center',
                        color:
                          location.pathname == route &&
                          theme.palette.primary.main,
                      }}
                    >
                      {e}
                    </ListItemIcon>
                    <ListItemText classes={{ primary: classes.listItem }}>
                      {name}
                    </ListItemText>
                    {sectionName == 'Perk Groups' && name != 'Add New Group' && (
                      <>
                        <IconButton
                          style={{ padding: 0 }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setAnchorEl(event.currentTarget);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          id={`${name} simple menu`}
                          open={Boolean(anchorEl)}
                          keepMounted
                          anchorEl={anchorEl}
                          onClose={(
                            event: React.MouseEvent<
                              HTMLButtonElement,
                              MouseEvent
                            >
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
                              setIsDeletePerkGroupModalVisible(name);
                            }}
                          >
                            Delete Perk Group
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        variant="outlined"
        className={classes.appBar}
        style={{ background: 'white' }}
      >
        {/* <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <img style={{ height: "30px" }} src={logo} />
          </Toolbar> */}
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden mdUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <Box margin="60px 20px 20px 20px">{children}</Box>
      </main>
      <ConfirmationModal
        isModalVisible={isDeletePerkGroupModalVisible != ''}
        setIsModalVisible={() => {
          setIsDeletePerkGroupModalVisible('');
        }}
        title="Delete Perk Group"
        description="Are you sure you want to delete this perk group and all of its employees? This cannot be undone."
        onConfirmation={deletePerkGroup}
      />
    </div>
  );
}
