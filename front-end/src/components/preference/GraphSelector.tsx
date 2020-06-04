import React, { useState, useEffect } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { setProcessedGraph } from "../../store/processedGraph";
import { fetchAndParseGraphData } from "../../common/graph-processing/stage1/parser.tf";
import { RawGraphOptimizer } from "../../common/graph-processing/stage1/raw-graph-optimizer.tf";
import { buildGraph } from "../../common/graph-processing/stage2/build-graph.tf";
import { buildMsGraph } from "../../common/graph-processing/stage2/build-graph.ms";
import { useGlobalConfigurations } from "../../store/global-configuration";
import { LayoutType } from "../../store/global-configuration.type";
import { setTfRawGraph } from "../../store/rawGraph.tf";
import { fetchGraphData, fetchLocalMsGraph } from "../../api";
import ProcessedGraphOptimizer from "../../common/graph-processing/stage2/processed-graph-optimizer";
import { setMsRawGraph } from "../../store/rawGraph.ms";
import useGraphPipeline from "../GraphPipeline/GraphPipeline";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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

export default function GraphSelector() {
  const classes = useStyles();
  const [graphMetadatas, setGraphMetadatas] = useState<GraphMetadata[]>([]);
  const [msGraphMetadatas, setMsGraphMetadatas] = useState<GraphMetadata[]>([]);
  const [currentTfGraphIndex, setCurrentTfGraphIndex] = useState<number>(0);
  const [currentMsGraphIndex, setCurrentMsGraphIndex] = useState<number>(0);
  useGraphPipeline();

  const {
    preprocessingPlugins,
    currentLayout,
    shouldOptimizeProcessedGraph,
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
    if (!isMsGraph) return; // MSGraph
    fetchLocalMsGraph(msGraphMetadatas[currentMsGraphIndex].name).then(
      (RawData) => {
        let parsedGraph = RawData.data.data; // 处理
        setMsRawGraph(parsedGraph);
      }
    );
  }, [currentMsGraphIndex, currentLayout]);

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
      })
  }, [
    currentTfGraphIndex,
    graphMetadatas,
    preprocessingPlugins,
    currentLayout,
  ]);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="graph-selector">current graph</InputLabel>
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
}
