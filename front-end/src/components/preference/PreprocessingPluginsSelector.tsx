import React, { useState } from "react";
import {
  makeStyles,
  Theme,
  createStyles,
  withStyles,
} from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch, { SwitchClassKey, SwitchProps } from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../store/global-configuration";
import {
  GlobalConfigurationsModificationType,
  LayoutType,
} from "../../store/global-configuration.type";

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 32,
      height: 20,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      "&$checked": {
        transform: "translateX(12px)",
        color: theme.palette.common.white,
        "& + $track": {
          backgroundColor: "#4d7e96",
          opacity: 1,
          border: "none",
        },
      },
      "&$focusVisible $thumb": {
        color: "#4d7e96",
        border: "6px solid #fff",
      },
    },
    thumb: {
      width: 18,
      height: 18,
      boxShadow: "none",
    },
    track: {
      borderRadius: 20 / 2,
      // border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: "#666",
      opacity: 1,
      transition: theme.transitions.create(["background-color", "border"]),
    },
    checked: {},
    focusVisible: {},
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2),
    },
    content: {
      margin: theme.spacing(1),
      maxHeight: 400,
      flexGrow: 1,
      maxWidth: 400,
      textAlign: "left",
      overflow: "auto",
    },
    FormControlLabelStyle: {
      marginLeft: theme.spacing(0),
      marginRight: "2px",
    },
    left: {
      float: "left",
      width: "164px",
    },
    right: {
      overflow: "hidden",
    },
  })
);

const descriptions = {
  pruneByOutput: "只保留正向子图",
  replaceVariable: "Variable替换",
  pruneByDefaultPatterns: "按规则裁剪",
  // renameVariable: "Variable重命名",(为了做左右两列整齐的布局，暂时这里留3个，第四个放到下面直接添加了。后面这里这能要改，因为这里还在判断是否是tfgraph)
};

export default function PreprocessingPluginsSelector() {
  const classes = useStyles();
  const {
    preprocessingPlugins,
    isHiddenInterModuleEdges,
    shouldOptimizeProcessedGraph,
    currentLayout,
  } = useGlobalConfigurations();

  const isTfGraph =
    currentLayout === LayoutType.DAGRE_FOR_TF ||
    currentLayout === LayoutType.TENSORBOARD ||
    currentLayout === LayoutType.ELK_FOR_TF;

  const isElkLayout =
    currentLayout === LayoutType.ELK_FOR_MS ||
    currentLayout === LayoutType.ELK_FOR_TF;

  const handleChange = (key) => () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_PREPROCESSING_PLUGIN,
      key
    );
  };
  const toggleIsHiddenInterModuleEdges = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_IS_HIDDEN_INTER_MODULE_EDGES
    );
  };
  const toggleProcessedGraphOptimizer = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_PROCESSED_GRAPH_OPTIMIZER
    );
  };

  return (
    <div className={classes.container}>
      <Typography>图处理方式</Typography>
      <div className={classes.content}>
        {/* 左三个 */}
        <div className={classes.left}>
          {isTfGraph &&
            Object.keys(descriptions).map((key) => (
              <FormControlLabel
                className={classes.FormControlLabelStyle}
                key={key}
                control={
                  <IOSSwitch
                    checked={preprocessingPlugins[key]}
                    onChange={handleChange(key)}
                  />
                }
                label={descriptions[key]}
              />
            ))}
        </div>
        {/* 右三个 */}
        <div className={classes.right}>
          {isTfGraph && (
            <FormControlLabel
              className={classes.FormControlLabelStyle}
              control={
                <IOSSwitch
                  checked={isHiddenInterModuleEdges}
                  onChange={toggleIsHiddenInterModuleEdges}
                />
              }
              label={"Variable重命名"}
            />
          )}
          <FormControlLabel
            className={classes.FormControlLabelStyle}
            control={
              <IOSSwitch
                checked={isHiddenInterModuleEdges}
                onChange={toggleIsHiddenInterModuleEdges}
              />
            }
            label={"挖孔式边绑定"}
          />
        </div>
        {/* 下面一个 */}
        <FormControlLabel
          className={classes.FormControlLabelStyle}
          control={
            <IOSSwitch
              checked={shouldOptimizeProcessedGraph}
              onChange={toggleProcessedGraphOptimizer}
            />
          }
          label={"ProcessedGraphOptimizer"}
        />
      </div>
    </div>
  );
}
