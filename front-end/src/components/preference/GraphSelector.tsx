import React, { useState, useEffect, useContext } from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  ThemeProvider,
} from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { fetchAndParseGraphData } from "../../common/graph-processing/stage1/parser.tf";
import { RawGraphOptimizer } from "../../common/graph-processing/stage1/raw-graph-optimizer.tf";
import MsRawGraphOptimizer from "../../common/graph-processing/stage1/raw-graph-optimizer.ms";
import { useGlobalConfigurations, modifyGlobalConfigurations } from "../../store/global-configuration";
import {
  LayoutType,
  GlobalConfigurationsModificationType,
} from "../../store/global-configuration.type";
import { setTfRawGraph } from "../../store/rawGraph.tf";
import { fetchLocalMsGraph, fetchSummaryGraph } from "../../api";
import { setMsRawGraph } from "../../store/rawGraph.ms";
import useGraphPipeline from "../GraphPipeline/GraphPipeline";
import fetchBackendData from "../FetchBackendData/FetchBackendData";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import { useGlobalStates, modifyGlobalStates } from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import { UpdateRectInCanvasContext } from '../../store/redrawCanvas';

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
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&>div:first-child": {
        backgroundColor: "rgba(0,0,0,0.1) !important",
      }
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
  const [loadingGraphData, setLoadingGraphData] = useState<boolean>(false);
  const [graphMetadatas, setGraphMetadatas] = useState<GraphMetadata[]>([]);
  const [msGraphMetadatas, setMsGraphMetadatas] = useState<GraphMetadata[]>([]);
  const [showSelector, setShowSelector] = useState<boolean>(true);
  const [currentTfGraphIndex, setCurrentTfGraphIndex] = useState<number>(0);
  const [currentMsGraphIndex, setCurrentMsGraphIndex] = useState<number>(0);
  const canvasContext = useContext(UpdateRectInCanvasContext);
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
    canvasContext.invokeUpdateRect();
    setCurrentMsGraphIndex(event.target.value);
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/data/graph-metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setGraphMetadatas(data);
      });
    fetch(process.env.PUBLIC_URL + "/data/ms-graph-metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setMsGraphMetadatas(data);
      });
  }, []);

  useEffect(() => {
    if (!isMsGraph || msGraphMetadatas.length < 1) return; // MSGraph

    setLoadingGraphData(true);

    const hashPath = location.hash.split("/");
    let graphName = msGraphMetadatas[currentMsGraphIndex].name;
    if (hashPath.length >= 3) { // 路径中包含graphname时，读取summary数据，禁用选择器
      setShowSelector(false);
      graphName = hashPath[2];
      fetchSummaryGraph(graphName).then((RawData) => {
        let parsedGraph = RawData.data.data; // 处理
        if (conceptualGraphMode) {
          const msGraphOptimizer = new MsRawGraphOptimizer();
          msGraphOptimizer.optimize(parsedGraph);
        }
        modifyGlobalStates(
          GlobalStatesModificationType.SET_CURRENT_MS_GRAPH_NAME,
          graphName
        );
        modifyGlobalConfigurations(
          GlobalConfigurationsModificationType.SET_DATA_MODE,
          "realtime"
        )
        setLoadingGraphData(false);
        setMsRawGraph(parsedGraph);
      });
    } else {                                                        // 路径中不包含graphname时，读取local数据，激活选择器
      setShowSelector(true);
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
        setLoadingGraphData(false);
      });
    }

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
  if (!showSelector) {
    return <></>
  }
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

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={loadingGraphData}
        >
          <Fade in={loadingGraphData}>
            <div >
              <CircularProgress size={100} />
            </div>
          </Fade>
        </Modal>

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
