import { Paper } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import AddIcon from "@material-ui/icons/Add";
import DashboardIcon from "@material-ui/icons/Dashboard";
import GroupIcon from "@material-ui/icons/Group";
import PersonIcon from "@material-ui/icons/Person";
import { AuthContext } from "contexts/Auth";
import firebase from "firebase/app";
import "firebase/firestore";
import logo from "images/logo.png";
import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 280;

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
      margin: "20px 25px",
      padding: "0px 10px",
      border: 0,
      backgroundColor: "#F2F3F5",
      height: "80px",
      alignItems: "center",
    },
    content: {
      flexGrow: 1,
      minWidth: "200px",
      padding: theme.spacing(3),
    },
    listItem: {
      fontSize: 14,
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
    ["Dashboard", "/dashboard", <DashboardIcon />],
  ];

  const peopleNav: [string, string, any][] = [
    ["Employees", "/people", <PersonIcon />],
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
    ["General", generalNav],
    ["People", peopleNav],
    ["Perk Groups", infoNav],
  ];

  const drawer = (
    <div>
      {/* <Toolbar /> */}
      <div className={classes.drawerContainer}>
        <div style={{ padding: "40px 30px" }}>
          <img style={{ height: "30px" }} src={logo} />
        </div>
        <Paper className={classes.avatarCard} variant="outlined">
          <Avatar
            alt={currentUser?.displayName}
            src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.m.wikipedia.org%2Fwiki%2FFile%3AMissing_avatar.svg&psig=AOvVaw3NzqKvydDCWL1eCABVrnYM&ust=1626138371997000&source=images&cd=vfe&ved=0CAoQjRxqFwoTCJjZqtOr3PECFQAAAAAdAAAAABAD"
          />
          <span>
            <Typography style={{ fontSize: "14px" }}>
              <Box fontWeight="bold">{currentUser?.displayName}</Box>
            </Typography>
            <Typography variant="caption">admin</Typography>
          </span>
        </Paper>
        <div style={{ padding: "10px 0" }}>
          {navSections.map(([sectionName, section], index) => (
            <div key={sectionName}>
              <Typography
                style={{
                  margin: "30px 0 0 40px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
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
                      backgroundColor: location.pathname == route && "#e6edff",
                      color:
                        location.pathname == route &&
                        theme.palette.primary.main,
                      borderRight:
                        location.pathname == route &&
                        `3px solid ${theme.palette.primary.main}`,
                      paddingLeft: "30px",
                    }}
                  >
                    <ListItemIcon
                      style={{
                        justifyContent: "center",
                        color:
                          location.pathname == route &&
                          theme.palette.primary.main,
                      }}
                    >
                      {e}
                    </ListItemIcon>
                    <ListItemText
                      primary={name}
                      classes={{ primary: classes.listItem }}
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          ))}
        </div>
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
          variant="outlined"
          className={classes.appBar}
          style={{ background: "white" }}
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
          <Box margin="60px 20px 20px 20px">{children}</Box>
        </main>
      </div>
    );
  }
}
