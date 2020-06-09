import React, { useState } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../store/global-configuration";
import {
  GlobalConfigurationsModificationType,
  LayoutType,
} from "../../store/global-configuration.type";

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
  })
);

const descriptions = {
  pruneByOutput: "只保留正向子图",
  replaceVariable: "Variable替换",
  pruneByDefaultPatterns: "按规则裁剪",
  renameVariable: "Variable重命名",
};

export default function PreprocessingPluginsSelector() {
  const classes = useStyles();
  const {
    preprocessingPlugins,
    isHiddenInterModuleEdges,
    shouldOptimizeProcessedGraph,
    shouldMergeEdge,
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
  const toggleMergeEdge = () => {
    modifyGlobalConfigurations(
      GlobalConfigurationsModificationType.TOGGLE_SHOULD_MERGE_EDGE
    );
  };

  return (
    <div className={classes.container}>
      <Typography>图处理方式选择</Typography>
      <div className={classes.content}>
        {isTfGraph &&
          Object.keys(descriptions).map((key) => (
            <FormControlLabel
              key={key}
              control={
                <Switch
                  checked={preprocessingPlugins[key]}
                  onChange={handleChange(key)}
                />
              }
              label={descriptions[key]}
            />
          ))}
        <FormControlLabel
          control={
            <Switch
              checked={isHiddenInterModuleEdges}
              onChange={toggleIsHiddenInterModuleEdges}
            />
          }
          label={"挖孔式边绑定"}
        />
        <FormControlLabel
          control={
            <Switch
              checked={shouldOptimizeProcessedGraph}
              onChange={toggleProcessedGraphOptimizer}
            />
          }
          label={"图处理优化"}
        />
        {isElkLayout && (
          <FormControlLabel
            control={
              <Switch checked={shouldMergeEdge} onChange={toggleMergeEdge} />
            }
            label={"ELK布局边合并"}
          />
        )}
      </div>
    </div>
  );
}
