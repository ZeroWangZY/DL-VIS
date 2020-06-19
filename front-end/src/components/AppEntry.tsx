import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import clsx from "clsx";
import {
  makeStyles,
  useTheme,
  Theme,
  createStyles,
} from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import DagreLayout from "./DagreLayout/DagreLayout";
import LaylerLevel from "./LaylerLevel/LaylerLevel";
import Snaphot from "./Snaphot/Snaphot";
import NodeSelector from "./preference/NodeSelector";
import TensorBoardGraph from "./tensorboard/Graph";
import GraphSelector from "./preference/GraphSelector";
import Diagnosis from "./preference/Diagnosis";
import ConceptualGraphMode from "./preference/ConceptualGraphMode"
import PreprocessingPluginsSelector from "./preference/PreprocessingPluginsSelector";
import LayoutSelector from "./preference/LayoutSelector";
import { useGlobalConfigurations } from "../store/global-configuration";
import { LayoutType } from "../store/global-configuration.type";
import ELKLayout from "./ELKLayout/ELKLayout";

const drawerWidth = 360, drawerHeight = 400; 

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      height: "100vh",
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      backgroundColor: "#344e61",
      // transition: theme.transitions.create(["margin", "width"], {
      //   easing: theme.transitions.easing.sharp,
      //   duration: theme.transitions.duration.leavingScreen,
      // }),
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
      margin: theme.spacing(8,0,0,0),
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      padding: 0,
      borderRadius: 0,
      borderRight: "1px solid #ccc",
      width: theme.spacing(2)
    },
    hide: {
      display: "none",
    },
    drawerLeft: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaperLeft: {
      width: drawerWidth,
      margin: theme.spacing(8,0,0,0),
    }, 
    drawerRight: {
      // width: drawerWidth,
      // height: '50vh',
      flexShrink: 0,
    },
    drawerPaperRight: {
      height: '50vh',
      width: drawerWidth,
      margin: theme.spacing(8,0,0,0),
    },
    drawerBottom: {
      // height: drawerHeight,
      flexShrink: 0,
      marginLeft: 360,
    },
    drawerPaperBottom: {
      height: drawerHeight,
      marginLeft: 360,
      // width: drawerWidth,
      // margin: theme.spacing(7,0,0,0),
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
  const { currentLayout } = useGlobalConfigurations();
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
          // className={clsx(classes.appBar, {
          //   [classes.appBarShift]: open,
          // })}
          className={classes.appBar}
        >
          <Toolbar>
            <Typography variant="h6" noWrap>
              Mindspore可视分析
            </Typography>
          </Toolbar>
        </AppBar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          className={clsx(classes.menuButton, open && classes.hide)}
        >
          <ChevronRightIcon />
        </IconButton>
        {/* ---------------------start of 左侧抽屉------------------------- */}
        <Drawer
          className={classes.drawerLeft}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaperLeft,
          }}
        >
          <div className={classes.drawerHeader}>
            <Typography style={{ width: "100%", paddingLeft: theme.spacing(6) }} variant="h6" noWrap>
              控制面板
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
          {/* leyout 去掉了，只显示elk布局的计算图 */}
          {/* <LayoutSelector />
          <Divider /> */}
          <GraphSelector />
          <Divider />
          <PreprocessingPluginsSelector />
          <Divider />
          <NodeSelector />
          {/* <Divider />
          <Diagnosis />
          <ConceptualGraphMode /> */}
        </Drawer>
        {/* ------------------------end of 左侧抽屉------------------------- */}
        {/* ------------------------- 中间画布 ---------------------------- */}
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
              <div style={{ height: "calc(100% - 364px)" }}>
                {currentLayout === LayoutType.DAGRE_FOR_TF && <DagreLayout />}
                {currentLayout === LayoutType.TENSORBOARD && (
                  <TensorBoardGraph />
                )}
                {currentLayout === LayoutType.DAGRE_FOR_MS && <DagreLayout />}
                {currentLayout === LayoutType.ELK_FOR_TF && <ELKLayout />}
                {currentLayout === LayoutType.ELK_FOR_MS && <ELKLayout />}
              </div>
              <Snaphot />
            </Route>
          </Switch>
        </main>
        {/* -------------------------end of 中间画布 ---------------------------- */}
        {/* ------------------------- 右侧抽屉----------------------------------- */}
        <Drawer
          className={classes.drawerRight}
          variant="persistent"
          anchor="right"
          open={open}
          classes={{
            paper: classes.drawerPaperRight,
          }}
        >

        </Drawer>
        {/* --------------------------end of 右侧抽屉------------------------------ */}
        {/* ------------------------- 下侧抽屉----------------------------------- */}
        <Drawer
          className={classes.drawerBottom}
          variant="persistent"
          anchor="bottom"
          open={open}
          classes={{
            paper: classes.drawerPaperBottom,
          }}
        >

        </Drawer>
        {/* --------------------------end of 下侧抽屉------------------------------ */}
      </div>
    </Router>
  );
};

export default AppEntry;