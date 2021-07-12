import React, { createContext, useContext, useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import { makeStyles, useTheme, Theme } from "@material-ui/core/styles";
import { createStyles } from "@material-ui/core/styles";
import { useLocation, Link } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import app from "firebaseApp";
import firebase from "firebase/app";
import "firebase/firestore";
import { AuthContext } from "contexts/Auth";

import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Hidden from "@material-ui/core/Hidden";
import GroupIcon from "@material-ui/icons/Group";

import Box from "@material-ui/core/Box";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import TableChartIcon from "@material-ui/icons/TableChart";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import { Card, Paper } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import ListAltIcon from "@material-ui/icons/ListAlt";
import PersonIcon from "@material-ui/icons/Person";
import FeedbackIcon from "@material-ui/icons/Feedback";
import logo from "images/logo.png";
import { assert } from "console";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    drawer: {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
      [theme.breakpoints.up("md")]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up("md")]: {
        display: "none",
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    drawerContainer: {
      overflow: "auto",
    },
    avatarCard: {
      display: "flex",

      "& > *": {
        margin: theme.spacing(1),
      },
      margin: "20px 10px",
    },
    content: {
      flexGrow: 1,
      minWidth: "200px",
      padding: theme.spacing(3),
    },
    listItem: {
      //       fontSize: 14,
    },
  })
);

export default function ClippedDrawer({ children }) {
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [useEffectComplete, setUseEffectComplete] = useState(false);
  const [groupV, setGroupViews] = useState({});

  const { currentUser } = useContext(AuthContext);

  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const generalNav: [string, string, any][] = [
    ["Employees", "/people", <PersonIcon />],
    // ['Your Study Stats', '/userstats', <EqualizerIcon />],
  ];

  const appNav: [string, string, any][] = [
    ["Todo (Coming Soon)", "/todoApp", <ListAltIcon />],
  ];

  const settingsNav: [string, string, any][] = [
    ["Profile", "/profile", <PersonIcon />],
  ];

  var groupViews: [string, string, any][] = [];

  console.log(groupV);

  if (groupV !== {}) {
    Object.keys(groupV)
      .sort()
      .forEach((group) => {
        groupViews.push([group, "/group/" + group, <GroupIcon />]);
      });
  }

  groupViews.push(["Add New Group", "/create/group", <AddIcon />]);

  const infoNav: [string, string, any][] = groupViews;

  const navSections: [string, [string, string, any][]][] = [
    ["People", generalNav],
    ["Perk Groups", infoNav],
  ];

  const drawer = (
    <div>
      <Toolbar />
      <div className={classes.drawerContainer}>
        <Paper className={classes.avatarCard} variant="outlined">
          <Avatar
            alt={currentUser?.displayName}
            src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.m.wikipedia.org%2Fwiki%2FFile%3AMissing_avatar.svg&psig=AOvVaw3NzqKvydDCWL1eCABVrnYM&ust=1626138371997000&source=images&cd=vfe&ved=0CAoQjRxqFwoTCJjZqtOr3PECFQAAAAAdAAAAABAD"
          />
          <span>
            <Typography style={{ lineHeight: "40px" }}>
              {currentUser?.displayName}
            </Typography>
            {/* <Typography variant="caption">Your Plan: Premium</Typography> */}
          </span>
        </Paper>
        <Divider />
        {navSections.map(([sectionName, section], index) => (
          <div key={sectionName}>
            <Typography style={{ margin: "20px 0 0 20px" }} component="div">
              <Box fontWeight="fontWeightBold">{sectionName}</Box>
            </Typography>
            <List>
              {section.map(([name, route, e], index) =>
                route.substring(0, 5) == "https" ? (
                  <ListItem
                    button
                    component={Link}
                    to={{
                      pathname: route,
                    }}
                    target="_blank"
                    key={name}
                  >
                    <ListItemIcon
                      style={{
                        justifyContent: "center",
                      }}
                    >
                      {e}
                    </ListItemIcon>
                    <ListItemText
                      primary={name}
                      classes={{ primary: classes.listItem }}
                    />
                  </ListItem>
                ) : (
                  //FIX LATER
                  <ListItem
                    button
                    component={Link}
                    to={route}
                    key={name}
                    //     style={{
                    //       color: location.pathname == route && "#FF6F61",
                    //     }}
                  >
                    <ListItemIcon
                      style={{
                        justifyContent: "center",
                        // color: location.pathname == route && "#FF6F61",
                      }}
                    >
                      {e}
                    </ListItemIcon>
                    <ListItemText
                      primary={name}
                      classes={{ primary: classes.listItem }}
                    />
                  </ListItem>
                )
              )}
            </List>
          </div>
        ))}
      </div>
    </div>
  );

  let adminData: any = {};

  //BELOW CODE DOESNT WORK
  useEffect(() => {
    if (currentUser) {
      const db = firebase.firestore();
      db.collection("admins")
        .doc(currentUser.uid)
        .get()
        .then((doc) => {
          const adminData = doc.data();
          if (adminData) {
            //   console.log("Document data:", doc.data());
            let businessId = adminData["companyID"];
            db.collection("businesses")
              .doc(businessId)
              .get()
              .then((doc) => {
                const groupData = doc.data();
                if (groupData) {
                  console.log(groupData["groups"]);
                  setGroupViews(groupData["groups"]);
                  setUseEffectComplete(true);
                }
              });
            // doc.data() will be undefined in this case
            //     console.log("No such document!");
          }
        })
        .catch((error) => {
          console.log("Error getting document:", error);
        });
    }
  }, []);

  if (useEffectComplete === false) {
    return <></>;
  } else {
    console.log(useEffectComplete);

    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={classes.appBar}
          style={{ background: "white" }}
        >
          <Toolbar>
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
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden mdUp implementation="css">
            <Drawer
              variant="temporary"
              anchor={theme.direction === "rtl" ? "right" : "left"}
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
          <Toolbar />
          <Box margin="5px 0 0 0 ">{children}</Box>
        </main>
      </div>
    );
  }
}
