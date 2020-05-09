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
import { useGlobalConfigurations } from '../../store/global-configuration';
import { setTfRawGraph } from '../../store/tf-raw-graph';

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
  const [currentGraphIndex, setCurrentGraphIndex] = useState<number>(0)
  const { preprocessingPlugins, currentLayout } = useGlobalConfigurations()
  const handleChange = (event: React.ChangeEvent<{ value: number }>) => {
    setCurrentGraphIndex(event.target.value);
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + 'data/graph-metadata.json').then(res => res.json())
      .then(data => {
        setGraphMetadatas(data)
      })
  }, [])

  useEffect(() => {
    if (graphMetadatas.length < 1) return
    fetchAndParseGraphData(
      process.env.PUBLIC_URL + graphMetadatas[currentGraphIndex].url, null)
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
  }, [currentGraphIndex, graphMetadatas, preprocessingPlugins, currentLayout])

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="graph-selector">current graph</InputLabel>
        <Select
          labelId="graph-selector"
          value={currentGraphIndex}
          onChange={handleChange}
        >
          {graphMetadatas.map((metadata, index) =>
            <MenuItem key={index} value={index}>{metadata.name}</MenuItem>
          )}
        </Select>
        {graphMetadatas.length > 0 && graphMetadatas[currentGraphIndex].description !== undefined ?
          <FormHelperText>description: {graphMetadatas[currentGraphIndex].description}</FormHelperText> :
          null}
      </FormControl>
    </div>
  );
}
