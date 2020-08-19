import React, { useEffect, useState } from "react";
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
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Snapshot from "../Snapshot/Snapshot";
import "./index.less";
import LayerLevel from "../LayerLevel/LayerLevel"
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import { ShowActivationOrGradient } from "../../store/global-states.type"
import { LayerNodeImp } from "../../common/graph-processing/stage2/processed-graph";
import { useProcessedGraph } from "../../store/processedGraph";

type Position = "outerBottom" | "innerBottom";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  pos: Position;
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

function a11yProps(index: any, pos: Position) {
  return {
    id: `full-width-tab-${pos}-${index}`,
    "aria-controls": `full-width-tabpanel-${pos}-${index}`,
  };
}

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

function TabPanel(params: TabPanelProps) {
  const { children, value, index, pos, ...other } = params;

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

export default () => {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState({ right: 0, outerBottom: 0, innerBottom: 0 });
  const { selectedNodeId, showActivationOrGradient } = useGlobalStates();
	const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;

  const toggleTab = (pos: Position) => (
    event: React.ChangeEvent<{}>,
    newValue: number
  ) => {
    modifyGlobalStates(
      GlobalStatesModificationType.SET_BOTTOMINFOTYPE,
      newValue
    );

    setValue({ ...value, [pos]: newValue });
  };

  const handleChange = event => {
    modifyGlobalStates(
      GlobalStatesModificationType.SET_SHOWACTIVATIONORGRADIENT,
      parseInt(event.target.value)
    );
  };

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
            disabled={!(nodeMap[selectedNodeId] instanceof LayerNodeImp)}
            {...a11yProps(1, "outerBottom")}
          />
        </Tabs>
        <TabPanel value={value["outerBottom"]} index={0} pos={"outerBottom"}>
          <Snapshot />
        </TabPanel>

        <TabPanel value={value["outerBottom"]} index={1} pos={"outerBottom"}>
          <div className="activationOrGradient-options">
            <p style={{ marginRight: 10, marginLeft: 20 }}>指标选择:</p>
            <div className="activationOrGradient-floatBlock">
              <input
                type="radio"
                value={ShowActivationOrGradient.ACTIVATION}
                onClick={handleChange}
                checked={showActivationOrGradient === ShowActivationOrGradient.ACTIVATION}
              />
              <label >activation</label>
            </div>

            <div className="activationOrGradient-floatBlock">
              <input type="radio"
                value={ShowActivationOrGradient.GRADIENT}
                onClick={handleChange}
                checked={showActivationOrGradient === ShowActivationOrGradient.GRADIENT}
              />
              <label >gradient</label>
            </div>
          </div>
          {/* layer level */}
          <LayerLevel />
        </TabPanel>

      </ThemeProvider>
    </div >
  );
};
