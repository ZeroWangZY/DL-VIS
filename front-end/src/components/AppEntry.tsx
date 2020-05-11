import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import clsx from 'clsx';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DagreLayout from "./DagreLayout/DagreLayout";
import LaylerLevel from "./LaylerLevel/LaylerLevel";
import NodeSelector from './preference/NodeSelector'
import TensorBoardGraph from './tensorboard/Graph'
import GraphSelector from './preference/GraphSelector';
import Diagnosis from './preference/Diagnosis';
import PreprocessingPluginsSelector from './preference/PreprocessingPluginsSelector'
import LayoutSelector from './preference/LayoutSelector';
import { useGlobalConfigurations } from '../store/global-configuration';
import { LayoutType } from "../store/global-configuration.type";
import ColaLayout from "./ColaLayout/ColaLayout";

const drawerWidth = 360;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      height: "100vh",
    },
    appBar: {
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(["margin", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    hide: {
      display: "none",
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: "flex-end",
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  })
);

const AppEntry: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const { currentLayout } = useGlobalConfigurations()
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Router>
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <SettingsIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            葫芦娃的项目
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <Typography style={{ width: "100%" }} variant="h6" noWrap>
            Preference
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <LayoutSelector />
        <Divider />
        <GraphSelector />
        <Divider />
        <PreprocessingPluginsSelector />
        <Divider />
        <NodeSelector />
        <Divider />
        <Diagnosis />
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        <Switch>
          <Route path="/layer">
              <LaylerLevel />
          </Route>
          <Route path="/">
            {currentLayout === LayoutType.DAGRE_FOR_TF ? <DagreLayout /> : null}
            {currentLayout === LayoutType.TENSORBOARD ? <TensorBoardGraph /> : null}
            {currentLayout === LayoutType.COLA_FOR_TF ? <ColaLayout /> : null}
          </Route>
        </Switch>
      </main>
    </div>
    </Router>
  );
};

export default AppEntry;
