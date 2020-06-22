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
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

const drawerWidth = 360; 

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
      flexShrink: 0,
    },
    drawerPaperRight: {
      height: '55vh',
      width: drawerWidth,
      margin: theme.spacing(8,0,0,0),
    },
    menuButtonRight: {
      height: '55vh',
      margin: theme.spacing(8,0,0,0),
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      padding: 0,
      borderRadius: 0,
      borderLeft: "1px solid #ccc",
      borderBottom: "1px solid #ccc",
      width: theme.spacing(2),
    },
    drawerBottom: {
      flexShrink: 0,
    },
    drawerPaperBottom: {
      height: '40vh',
      marginLeft: 360,
      // width: drawerWidth,
      // margin: theme.spacing(7,0,0,0),
    },
    menuButtonBottom: {
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      padding: 0,
      borderRadius: 0,
      borderTop: "1px solid #ccc",
      height: theme.spacing(2),
      width: `calc(100% - ${drawerWidth}px)`,
      position: 'absolute',
      top: `calc(100% - ${theme.spacing(2)}px)`,
      left: `calc(${drawerWidth+12}px)`,
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
    // indicator:{
    //   color: "#c7000b",
    // },
    tabsStyle: {
      borderBottom: '1px solid #ccc',
    },
    innerTabsStyle: {
      borderBottom: '1px solid #ccc',
      maxHeight: theme.spacing(5),
      minHeight: 0,
      fontSize: '8px',
    },
    tabStyle: {
      minWidth: 70,
    },
    itabStyle: {
      minWidth: 70,
      fontSize: '12px',
    },
  })
);

// tab的位置
type Position = 'right' | 'outerBottom' | 'innerBottom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  pos: Position;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, pos, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${pos}-${index}`}
      aria-labelledby={`simple-tab-${pos}-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}



function a11yProps(index: any, pos: Position) {
  return {
    id: `full-width-tab-${pos}-${index}`,
    'aria-controls': `full-width-tabpanel-${pos}-${index}`,
  };
}

type Anchor = 'left' | 'bottom' | 'right';

const AppEntry: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();
  // const [open, setOpen] = React.useState(true);
  const { currentLayout } = useGlobalConfigurations();
  const [state, setState] = React.useState({
    left: true,
    bottom: true,
    right: true,
  });

  const toggleDrawer = (anchor: Anchor, open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent,
  ) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    console.log('toggle');
    console.log('click'+anchor+open);
    setState({ ...state, [anchor]: open });
  };

  // Tab
  // const [value, setValue] = React.useState(0);
  const [value, setValue] = React.useState({
    right: 0,
    outerBottom: 0,
    innerBottom: 0,
  });
  const toggleTab = (pos: Position) => (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue({ ...value, [pos]: newValue});
  };

  // const toggleTab('right', ) = (event: React.ChangeEvent<{}>, newValue: number) => {
  //   setValue(newValue);
  // };

  // const toggleTab('right', )Index = (index: number) => {
  //   setValue(index);
  // };

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
          onClick={toggleDrawer("left", true)}
          edge="start"
          className={clsx(classes.menuButton, state["left"] && classes.hide)}
        >
          <ChevronRightIcon />
        </IconButton>
        {/* ---------------------start of 左侧抽屉------------------------- */}
        <Drawer
          className={classes.drawerLeft}
          variant="persistent"
          anchor="left"
          // open={open}
          open={state["left"]}
          classes={{
            paper: classes.drawerPaperLeft,
          }}
        >
          <div className={classes.drawerHeader}>
            <Typography style={{ width: "100%", paddingLeft: theme.spacing(6) }} variant="h6" noWrap>
              控制面板
            </Typography>
            <IconButton onClick={toggleDrawer("left", false)}>
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
          // className={classes.content}
          className={clsx(classes.content, {
            [classes.contentShift]: state['left'],
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
              {/* <Snaphot />移动到下方的tab中 */}
            </Route>
          </Switch>
        </main>
        {/* -------------------------end of 中间画布 ---------------------------- */}
        {/* ------------------------- 右侧抽屉----------------------------------- */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer("right", true)}
          edge="start"
          className={clsx(classes.menuButtonRight, state["right"] && classes.hide)}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Drawer
          className={classes.drawerRight}
          variant="persistent"
          anchor="right"
          open={state["right"]}
          classes={{
            paper: classes.drawerPaperRight,
          }}
        >
          <Tabs value={value['right']} onChange={toggleTab('right')} 
          indicatorColor="secondary"
            textColor="secondary" 
            className={classes.tabsStyle}
            aria-label="info panel">
            <Tab className={classes.tabStyle} label="图例" {...a11yProps(0,'right')} />
            <Tab className={classes.tabStyle} label="属性" {...a11yProps(1,'right')} />
            <IconButton style={{marginLeft: `calc(${drawerWidth-190}px)`}} onClick={toggleDrawer("right", false)}>
              <ChevronRightIcon />
            </IconButton>
          </Tabs>
          <TabPanel value={value['right']} index={0} pos={'right'}>
            Item One
          </TabPanel>
          <TabPanel value={value['right']} index={1} pos={'right'}>
            Item Two
          </TabPanel>
        </Drawer>
        
        {/* --------------------------end of 右侧抽屉------------------------------ */}
        {/* ------------------------- 下侧抽屉----------------------------------- */}
        <Drawer
          className={classes.drawerBottom}
          variant="persistent"
          anchor="bottom"
          open={state["bottom"]}
          classes={{
            paper: classes.drawerPaperBottom,
          }}
        >
          <Tabs value={value['outerBottom']} onChange={toggleTab('outerBottom')} 
          indicatorColor="secondary"
            textColor="secondary" 
            className={classes.tabsStyle}
            aria-label="dynamic info panel">
            <Tab style={{paddingLeft: theme.spacing(3)}} className={classes.tabStyle} label="Model level" {...a11yProps(0,'outerBottom')} />
            <Tab className={classes.tabStyle} label="Layer level" {...a11yProps(1,'outerBottom')} />
            <IconButton style={{marginLeft: `calc(100% - ${drawerWidth-65}px)`}} onClick={toggleDrawer("bottom", false)}>
              <ExpandMoreIcon />
            </IconButton>
          </Tabs>
          <TabPanel value={value['outerBottom']} index={0} pos={'outerBottom'}>
            Item One
          </TabPanel>
          <TabPanel value={value['outerBottom']} index={1} pos={'outerBottom'}>
            {/* layer level 的tab */}
            <Tabs value={value['innerBottom']} onChange={toggleTab('innerBottom')} 
            indicatorColor="secondary"
              textColor="secondary" 
              className={classes.innerTabsStyle}
              aria-label="info panel">
              <Tab style={{paddingLeft: theme.spacing(3)}} className={classes.itabStyle} label="loss" {...a11yProps(0,'innerBottom')} />
              <Tab className={classes.itabStyle} label="accuracy" {...a11yProps(1,'innerBottom')} />
              <Tab className={classes.itabStyle} label="activation" {...a11yProps(2,'innerBottom')} />
              <Tab className={classes.itabStyle} label="gradient" {...a11yProps(3,'innerBottom')} />
            </Tabs>
            <TabPanel value={value['innerBottom']} index={0} pos={'innerBottom'}>
              Item One
            </TabPanel>
            <TabPanel value={value['innerBottom']} index={1} pos={'innerBottom'}>
              Item Two
            </TabPanel>
            <TabPanel value={value['innerBottom']} index={2} pos={'innerBottom'}>
              Item Two
            </TabPanel>
            <TabPanel value={value['innerBottom']} index={3} pos={'innerBottom'}>
              Item Two
            </TabPanel>
          </TabPanel>
        </Drawer>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer("bottom", true)}
          edge="start"
          className={clsx(classes.menuButtonBottom, true)}
        >
          <ExpandLessIcon />
        </IconButton>
        {/* --------------------------end of 下侧抽屉------------------------------ */}
      </div>
    </Router>
  );
};

export default AppEntry;