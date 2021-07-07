import React from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles, useTheme, Theme } from '@material-ui/core/styles'
import { createStyles } from '@material-ui/core/styles'
import { useLocation, Link } from 'react-router-dom'

import InboxIcon from '@material-ui/icons/MoveToInbox'
import MailIcon from '@material-ui/icons/Mail'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Hidden from '@material-ui/core/Hidden'
import GroupIcon from '@material-ui/icons/Group';

import Box from '@material-ui/core/Box'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Avatar from '@material-ui/core/Avatar'
import CssBaseline from '@material-ui/core/CssBaseline'
import Toolbar from '@material-ui/core/Toolbar'
import List from '@material-ui/core/List'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import TableChartIcon from '@material-ui/icons/TableChart'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import { Card, Paper } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import ListAltIcon from '@material-ui/icons/ListAlt'
import PersonIcon from '@material-ui/icons/Person'
import FeedbackIcon from '@material-ui/icons/Feedback'

const drawerWidth = 240

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
      margin: '20px 10px',
    },
    content: {
      flexGrow: 1,
      minWidth: '200px',
      padding: theme.spacing(3),
    },
  })
)

export default function ClippedDrawer({ children }) {
  const classes = useStyles()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const generalNav: [string, string, any][] = [
    ['People & Permissions', '/people', <PersonIcon />],
    // ['Your Study Stats', '/userstats', <EqualizerIcon />],
    ['Groups', '/groups', <GroupIcon />],
  ]

  const appNav: [string, string, any][] = [
    ['Todo (Coming Soon)', '/todoApp', <ListAltIcon />],
  ]

  const settingsNav: [string, string, any][] = [
    ['Profile', '/profile', <PersonIcon />],
  ]

  const infoNav: [string, string, any][] = [
    // ['FAQ', '/faq', <LiveHelpIcon />],
    ['Feedback Form', 'https://forms.gle/6AKTsMDz2DmJVAvy5', <FeedbackIcon />],
  ]

  const navSections: [string, [string, string, any][]][] = [
    ['Manage', generalNav],
    // ['Apps', appNav],
    // ['Settings', settingsNav],
    //['Info', infoNav],
  ]

  const drawer = (
    <div>
      <Toolbar />
      <div className={classes.drawerContainer}>
        {/* <Paper className={classes.avatarCard}>
          <Avatar
            alt="Remy Sharp"
            src="https://material-ui.com/static/images/avatar/1.jpg"
          />
          <span>
            <Typography>Cole Killian</Typography>
            <Typography variant="caption">Your Plan: Premium</Typography>
          </span>
        </Paper>
        <Divider /> */}
        {navSections.map(([sectionName, section], index) => (
          <>
            <Typography style={{ margin: '20px 0 0 20px' }} component="div">
              <Box fontWeight="fontWeightBold">{sectionName}</Box>
            </Typography>
            <List>
              {section.map(([name, route, e], index) =>
                route.substring(0, 5) == 'https' ? (
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
                        justifyContent: 'center',
                      }}
                    >
                      {e}
                    </ListItemIcon>
                    <ListItemText primary={name} />
                  </ListItem>
                ) : (
                  <ListItem
                    button
                    component={Link}
                    to={route}
                    key={name}
                    style={{
                      color:
                        location.pathname.split('/')[1] ==
                          route.split('/')[1] && '#FF6F61',
                    }}
                  >
                    <ListItemIcon
                      style={{
                        justifyContent: 'center',
                        color:
                          location.pathname.split('/')[1] ==
                            route.split('/')[1] && '#FF6F61',
                      }}
                    >
                      {e}
                    </ListItemIcon>
                    <ListItemText primary={name} />
                  </ListItem>
                )
              )}
            </List>
          </>
        ))}
      </div>
    </div>
  )

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
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
          <img style={{ height: '30px' }} src="/logo.svg" />
        </Toolbar>
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
        <Toolbar />
        <Box margin="5px 0 0 0 ">{children}</Box>
      </main>
    </div>
  )
}