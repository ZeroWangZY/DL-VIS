import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  useTheme,
  createStyles,
  makeStyles,
  Theme,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Snaphot from "../Snaphot/Snaphot";
import "./index.less";
import LayerLevel from "../LayerLevel/LayerLevel"
import { ShowActivationOrGradient } from "../../store/global-states.type"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    tabsStyle: {
      borderBottom: "1px solid #ccc",
    },
    innerTabsStyle: {
      borderBottom: "1px solid #ccc",
      maxHeight: theme.spacing(5),
      minHeight: 0,
      fontSize: "8px",
    },
    tabStyle: {
      minWidth: 70,
    },
    itabStyle: {
      minWidth: 70,
      fontSize: "12px",
    },
    indicator: {
      backgroundColor: "#00a5a7",
    },
  })
);

export default () => {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState({
    right: 0,
    outerBottom: 0,
    innerBottom: 0,
  });

  type Position = "outerBottom" | "innerBottom";

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
        {value === index && <Box>{children}</Box>}
      </div>
    );
  }

  const toggleTab = (pos: Position) => (
    event: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    setValue({ ...value, [pos]: newValue });
  };

  function a11yProps(index: any, pos: Position) {
    return {
      id: `full-width-tab-${pos}-${index}`,
      "aria-controls": `full-width-tabpanel-${pos}-${index}`,
    };
  }

  const fontTheme = createMuiTheme({
    typography: {
      fontFamily: [
        "Helvetica Neue",
        "Helvetica",
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft YaHei",
        "Arial",
        "sans-serif",
      ].join(","),
    },
  });

  return (
    <div className="">
      <ThemeProvider theme={fontTheme}>
        <Tabs
          value={value["outerBottom"]}
          onChange={toggleTab("outerBottom")}
          classes={{ indicator: classes.indicator }}
          className={classes.tabsStyle}
          aria-label="dynamic info panel"
        >
          <Tab
            style={{
              paddingLeft: theme.spacing(3),
              color: value["outerBottom"] === 0 ? "#00a5a7" : "#333",
            }}
            className={classes.tabStyle}
            label="模型信息"
            {...a11yProps(0, "outerBottom")}
          />
          <Tab
            style={{ color: value["outerBottom"] === 1 ? "#00a5a7" : "#333" }}
            className={classes.tabStyle}
            label="层信息"
            {...a11yProps(1, "outerBottom")}
          />
        </Tabs>
        <TabPanel value={value["outerBottom"]} index={0} pos={"outerBottom"}>
          <Snaphot />
        </TabPanel>
        <TabPanel value={value["outerBottom"]} index={1} pos={"outerBottom"}>
          {/* layer level 的tab */}
          <Tabs
            value={value["innerBottom"]}
            onChange={toggleTab("innerBottom")}
            className={classes.innerTabsStyle}
            classes={{ indicator: classes.indicator }}
            aria-label="info panel"
          >
            <Tab
              style={{
                paddingLeft: theme.spacing(3),
                color: value["innerBottom"] === 0 ? "#00a5a7" : "#333",
              }}
              className={classes.itabStyle}
              label="Activation"
              {...a11yProps(0, "innerBottom")}
            />
            <Tab
              style={{
                color: value["innerBottom"] === 1 ? "#00a5a7" : "#333",
              }}
              className={classes.itabStyle}
              label="Gradient"
              {...a11yProps(1, "innerBottom")}
            />
          </Tabs>
          <TabPanel value={value["innerBottom"]} index={0} pos={"innerBottom"}>
            <LayerLevel />
          </TabPanel>
          <TabPanel value={value["innerBottom"]} index={1} pos={"innerBottom"}>
            <LayerLevel />
          </TabPanel>
        </TabPanel>
      </ThemeProvider>
    </div >
  );
};
