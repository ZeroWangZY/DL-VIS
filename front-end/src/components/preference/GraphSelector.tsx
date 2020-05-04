import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { setProcessedGraph } from '../../store/useProcessedGraph'
import { fetchAndParseGraphData } from '../../common/graph-processing/tf-graph/parser';
import { SimplifierImp } from '../../common/graph-processing/tf-graph/simplifier';
import { buildGraph } from '../../common/graph-processing/tf-graph/graph';
import { buildMsGraph } from '../../common/graph-processing/ms-graph/graph';
import { useGlobalConfigurations } from '../../store/global-configuration';
import { LayoutType } from '../../store/global-configuration.type';
import { setTfRawGraph } from '../../store/tf-raw-graph';
import { fetchGraphData, fetchLocalMsGraph } from "../../api"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      width: '80%'
    },
  }),
);

interface GraphMetadata {
  name: string;
  url: string;
  description?: string;
}

export default function GraphSelector() {
  const classes = useStyles();
  const [graphMetadatas, setGraphMetadatas] = useState<GraphMetadata[]>([])
  const [msGraphMetadatas, setMsGraphMetadatas] = useState<GraphMetadata[]>([])
  const [currentTfGraphIndex, setCurrentTfGraphIndex] = useState<number>(0)
  const [currentMsGraphIndex, setCurrentMsGraphIndex] = useState<number>(0)

  // enum LayoutType {DAGRE_FOR_TF, TENSORBOARD, DAGRE_FOR_MS}
  const { preprocessingPlugins, currentLayout } = useGlobalConfigurations()
  const handleTfGraphIndexChange = (event: React.ChangeEvent<{ value: number }>) => {
    setCurrentTfGraphIndex(event.target.value);
  };
  const handleMsGraphIndexChange = (event: React.ChangeEvent<{ value: number }>) => {
    setCurrentMsGraphIndex(event.target.value);
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + 'data/graph-metadata.json').then(res => res.json())
      .then(data => {
        setGraphMetadatas(data)
      })
  }, [])

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + 'data/ms-graph-metadata.json').then(res => res.json())
      .then(data => {
        setMsGraphMetadatas(data)
      })
  }, [])

  useEffect(() => {
    if (currentLayout !== LayoutType.DAGRE_FOR_MS) return; // MSGraph

    //TODO: bert_finetune、mobilenetv2有问题
    fetchLocalMsGraph(msGraphMetadatas[currentMsGraphIndex].name).then(RawData => {
      let ParsedGraph = RawData.data.data; // 处理
      console.log(ParsedGraph)
      const hGraph = buildMsGraph(ParsedGraph);
      setProcessedGraph(hGraph)
    })
  }, [currentMsGraphIndex, currentLayout])

  useEffect(() => {
    if (currentLayout !== LayoutType.DAGRE_FOR_TF) return; // TFGraph
    if (graphMetadatas.length < 1) return
    fetchAndParseGraphData(
      process.env.PUBLIC_URL + graphMetadatas[currentTfGraphIndex].url, null)
      .then(graph => {
        const simplifier = new SimplifierImp(preprocessingPlugins);
        return simplifier.withTracker()(graph);
      })
      .then(graph => {
        setTfRawGraph(graph)
        return graph
      })
      .then(async graph => {
        const hGraph = await buildGraph(graph);
        setProcessedGraph(hGraph)
      })
  }, [currentTfGraphIndex, graphMetadatas, preprocessingPlugins, currentLayout])

  return (
    <div>
      <FormControl className={classes.formControl}>
        {(currentLayout === LayoutType.DAGRE_FOR_MS || currentLayout === LayoutType.DAGRE_FOR_TF)
          && <InputLabel id="graph-selector">current graph</InputLabel>}
        {currentLayout === LayoutType.DAGRE_FOR_TF &&
          <Select
            labelId="graph-selector"
            value={currentTfGraphIndex}
            onChange={handleTfGraphIndexChange}
          >
            {graphMetadatas.map((metadata, index) =>
              <MenuItem key={index} value={index}>{metadata.name}</MenuItem>
            )}
          </Select>
        }
        {currentLayout === LayoutType.DAGRE_FOR_MS &&
          <Select
            labelId="graph-selector"
            value={currentMsGraphIndex}
            onChange={handleMsGraphIndexChange}
          >
            {msGraphMetadatas.map((metadata, index) =>
              <MenuItem key={index} value={index}>{metadata.name}</MenuItem>
            )}
          </Select>
        }

        {currentLayout === LayoutType.DAGRE_FOR_TF &&
          graphMetadatas.length > 0 && graphMetadatas[currentTfGraphIndex].description !== undefined ?
          <FormHelperText>description: {graphMetadatas[currentTfGraphIndex].description}</FormHelperText> :
          null}
        {currentLayout === LayoutType.DAGRE_FOR_MS &&
          msGraphMetadatas.length > 0 && msGraphMetadatas[currentMsGraphIndex].description !== undefined ?
          <FormHelperText>description: {msGraphMetadatas[currentMsGraphIndex].description}</FormHelperText> :
          null}
      </FormControl>
    </div>
  );
}
