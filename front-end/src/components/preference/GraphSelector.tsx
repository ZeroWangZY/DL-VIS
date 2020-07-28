import React, { useState, useEffect } from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  ThemeProvider,
} from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { fetchAndParseGraphData } from "../../common/graph-processing/stage1/parser.tf";
import { RawGraphOptimizer } from "../../common/graph-processing/stage1/raw-graph-optimizer.tf";
import MsRawGraphOptimizer from "../../common/graph-processing/stage1/raw-graph-optimizer.ms";
import { useGlobalConfigurations } from "../../store/global-configuration";
import {
  LayoutType,
  GlobalConfigurationsModificationType,
} from "../../store/global-configuration.type";
import { setTfRawGraph } from "../../store/rawGraph.tf";
import { fetchLocalMsGraph } from "../../api";
import { setMsRawGraph } from "../../store/rawGraph.ms";
import useGraphPipeline from "../GraphPipeline/GraphPipeline";
import fetchBackendData from "../FetchBackendData/FetchBackendData";
import Typography from "@material-ui/core/Typography";
import { useGlobalStates, modifyGlobalStates } from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";

const VALID_GRAPH_NAME = new Set([
  "lenet",
  "alexnets",
  "bert_finetune",
  "bert_pretrain",
  "mobilenetv2",
  "resnet",
]);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2),
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width: "80%",
    },
  })
);

interface GraphMetadata {
  name: string;
  url: string;
  description?: string;
}

const GraphSelector = (props) => {
  const classes = useStyles();
  const [graphMetadatas, setGraphMetadatas] = useState<GraphMetadata[]>([]);
  const [msGraphMetadatas, setMsGraphMetadatas] = useState<GraphMetadata[]>([]);
  const [currentTfGraphIndex, setCurrentTfGraphIndex] = useState<number>(0);
  const [currentMsGraphIndex, setCurrentMsGraphIndex] = useState<number>(0);
  useGraphPipeline();
  fetchBackendData();

  const {
    preprocessingPlugins,
    currentLayout,
    conceptualGraphMode,
  } = useGlobalConfigurations();

  const isTfGraph =
    currentLayout === LayoutType.DAGRE_FOR_TF ||
    currentLayout === LayoutType.TENSORBOARD ||
    currentLayout === LayoutType.ELK_FOR_TF;

  const isMsGraph =
    currentLayout === LayoutType.DAGRE_FOR_MS ||
    currentLayout === LayoutType.ELK_FOR_MS;

  const handleTfGraphIndexChange = (
    event: React.ChangeEvent<{ value: number }>
  ) => {
    setCurrentTfGraphIndex(event.target.value);
  };
  const handleMsGraphIndexChange = (
    event: React.ChangeEvent<{ value: number }>
  ) => {
    setCurrentMsGraphIndex(event.target.value);
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "data/graph-metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setGraphMetadatas(data);
      });
    fetch(process.env.PUBLIC_URL + "data/ms-graph-metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setMsGraphMetadatas(data);
      });
  }, []);

  useEffect(() => {
    if (!isMsGraph || msGraphMetadatas.length < 1) return; // MSGraph
    const hashPath = location.hash.split("/");
    let graphName = msGraphMetadatas[currentMsGraphIndex].name;
    if (hashPath.length >= 3 && VALID_GRAPH_NAME.has(hashPath[2])) {
      graphName = hashPath[2];
    }
    fetchLocalMsGraph(graphName).then((RawData) => {
      let parsedGraph = RawData.data.data; // 处理
      if (conceptualGraphMode) {
        const msGraphOptimizer = new MsRawGraphOptimizer();
        msGraphOptimizer.optimize(parsedGraph);
      }
      modifyGlobalStates(
        GlobalStatesModificationType.SET_CURRENT_MS_GRAPH_NAME,
        graphName
      );
      setMsRawGraph(parsedGraph);
    });
  }, [
    currentMsGraphIndex,
    currentLayout,
    conceptualGraphMode,
    msGraphMetadatas,
  ]);

  useEffect(() => {
    if (!isTfGraph) return; // TFGraph

    if (graphMetadatas.length < 1) return;
    fetchAndParseGraphData(
      process.env.PUBLIC_URL + graphMetadatas[currentTfGraphIndex].url,
      null
    )
      .then((graph) => {
        const rawGraphoptimizer = new RawGraphOptimizer(preprocessingPlugins);
        return rawGraphoptimizer.withTracker()(graph);
      })
      .then((graph) => {
        setTfRawGraph(graph);
        return graph;
      });
  }, [
    currentTfGraphIndex,
    graphMetadatas,
    preprocessingPlugins,
    currentLayout,
  ]);

  return (
    <div className={classes.container}>
      <Typography>图数据集</Typography>
      <FormControl className={classes.formControl}>
        <InputLabel id="graph-selector"></InputLabel>
        {isTfGraph && (
          <Select
            labelId="graph-selector"
            value={currentTfGraphIndex}
            onChange={handleTfGraphIndexChange}
          >
            {graphMetadatas.map((metadata, index) => (
              <MenuItem key={index} value={index}>
                {metadata.name}
              </MenuItem>
            ))}
          </Select>
        )}
        {isMsGraph && (
          <Select
            style={{ marginTop: "0px" }}
            labelId="graph-selector"
            value={currentMsGraphIndex}
            onChange={handleMsGraphIndexChange}
          >
            {msGraphMetadatas.map((metadata, index) => (
              <MenuItem key={index} value={index}>
                {metadata.name}
              </MenuItem>
            ))}
          </Select>
        )}

        {isTfGraph &&
          graphMetadatas.length > 0 &&
          graphMetadatas[currentTfGraphIndex].description !== undefined && (
            <FormHelperText>
              description: {graphMetadatas[currentTfGraphIndex].description}
            </FormHelperText>
          )}
        {isMsGraph &&
          msGraphMetadatas.length > 0 &&
          msGraphMetadatas[currentMsGraphIndex].description !== undefined && (
            <FormHelperText>
              description: {msGraphMetadatas[currentMsGraphIndex].description}
            </FormHelperText>
          )}
      </FormControl>
    </div>
  );
};

export default GraphSelector;
