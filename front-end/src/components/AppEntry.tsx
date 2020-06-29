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
      // backgroundColor: "#344e61",
      backgroundImage: 'linear-gradient(180deg,#263d5f,#16233b)',
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
      width: theme.spacing(3),
    },
    menuButtonShift: {
      transition: theme.transitions.create("height", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      height: 543,//这里写计算公式不生效，直接写的右侧抽屉的高度
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
      height: `calc(100% - 467px)`,
      width: drawerWidth,
      margin: theme.spacing(8,0,0,0),
      borderBottom: "1px solid #ccc",
    },
    menuButtonRight: {
      height: `calc(100% - 467px)`,
      // margin: theme.spacing(8,0,0,0),
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      padding: 0,
      borderRadius: 0,
      borderLeft: "1px solid #ccc",
      borderBottom: "1px solid #ccc",
      width: theme.spacing(3),
      position: 'absolute',
      top: theme.spacing(8),
      right: 1,
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
    drawerPaperBottomShift: {
      transition: theme.transitions.create("marginLeft", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    menuButtonBottom: {
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      padding: 0,
      borderRadius: 0,
      borderTop: "1px solid #ccc",
      height: theme.spacing(3),
      width: `calc(100% - ${drawerWidth}px)`,
      position: 'absolute',
      bottom: 1,
      left: `calc(${drawerWidth+12}px)`,
    },
    menuButtonBottomShift: {
      transition: theme.transitions.create(["left","width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      left: 36,
      width: `calc(100% - ${theme.spacing(3)}px)`
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
      height: `calc(100% - 0px)`,
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
    indicator: {
      backgroundColor: '#00a5a7',
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

//   const styles = theme => ({
//   indicator: {
//     backgroundColor: 'white',
//   },
// })

  // minimap
 const minimapPosition = (rightState: boolean, bottomState: boolean) => {
   let right = 0, bottom = 0;
   if (rightState && bottomState) {
     right = drawerWidth + 5;
     bottom = window.innerHeight * 0.4 + 5;
   }
   if (bottomState && !rightState) {
     bottom = window.innerHeight * 0.4 + 5;
     right = theme.spacing(3) + 5;
   }
   if (rightState && !bottomState || !rightState && !bottomState) {
     right = theme.spacing(3) + 5;
     bottom = theme.spacing(3) + 5;
   }
   return {bottom: bottom, right: right};
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
            {/* <Typography variant="h6" noWrap>
              Mindspore可视分析
            </Typography> */}
            <img src={process.env.PUBLIC_URL + 'logo-mindspore.png'} alt='log'/>
          </Toolbar>
        </AppBar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer("left", true)}
          edge="start"
          className={clsx({[classes.menuButton]: true || state["left"] && classes.hide}, {[classes.menuButtonShift]: (state['bottom'] && !state['left'])})}
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
              <div style={{ height: "calc(100% - 64px)" }}>
                {currentLayout === LayoutType.DAGRE_FOR_TF && <DagreLayout />}
                {currentLayout === LayoutType.TENSORBOARD && (
                  <TensorBoardGraph />
                )}
                {currentLayout === LayoutType.DAGRE_FOR_MS && <DagreLayout />}
                {currentLayout === LayoutType.ELK_FOR_TF && <ELKLayout {...minimapPosition(state['right'], state['bottom'])}/>}
                {currentLayout === LayoutType.ELK_FOR_MS && <ELKLayout {...minimapPosition(state['right'], state['bottom'])}/>}
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
            classes={{indicator: classes.indicator}}
            className={classes.tabsStyle}
            aria-label="info panel">
            <Tab className={classes.tabStyle} label="图例" style={{color: value['right']===0?'#00a5a7':'#333'}} {...a11yProps(0,'right')} />
            <Tab className={classes.tabStyle} label="属性" style={{color: value['right']===1?'#00a5a7':'#333'}} {...a11yProps(1,'right')} />
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
            paper: clsx(classes.drawerPaperBottom, {[classes.drawerPaperBottomShift]: !state['left']})
          }}
        >
          <Tabs value={value['outerBottom']} onChange={toggleTab('outerBottom')} 
            classes={{indicator: classes.indicator}}
            className={classes.tabsStyle}
            aria-label="dynamic info panel">
            <Tab style={{paddingLeft: theme.spacing(3), color: value['outerBottom']===0?'#00a5a7':'#333'}} className={classes.tabStyle} label="Model level" {...a11yProps(0,'outerBottom')} />
            <Tab style={{color: value['outerBottom']===1?'#00a5a7':'#333'}} className={classes.tabStyle} label="Layer level" {...a11yProps(1,'outerBottom')} />
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
              className={classes.innerTabsStyle}
              classes={{indicator: classes.indicator}}
              aria-label="info panel">
              <Tab style={{paddingLeft: theme.spacing(3), color: value['innerBottom']===0?'#00a5a7':'#333'}} className={classes.itabStyle} label="loss" {...a11yProps(0,'innerBottom')} />
              <Tab style={{color: value['innerBottom']===1?'#00a5a7':'#333'}} className={classes.itabStyle} label="accuracy" {...a11yProps(1,'innerBottom')} />
              <Tab style={{color: value['innerBottom']===2?'#00a5a7':'#333'}} className={classes.itabStyle} label="activation" {...a11yProps(2,'innerBottom')} />
              <Tab style={{color: value['innerBottom']===3?'#00a5a7':'#333'}} className={classes.itabStyle} label="gradient" {...a11yProps(3,'innerBottom')} />
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
          className={clsx({[classes.menuButtonBottom]: true || state["bottom"] && classes.hide}, {[classes.menuButtonBottomShift]: !state["left"]})}
        >
          <ExpandLessIcon />
        </IconButton>
        {/* --------------------------end of 下侧抽屉------------------------------ */}
      </div>
    </Router>
  );
};

export default AppEntry;