import React, { useEffect, useState } from "react";
import { ShowActivationOrGradient } from "../../store/global-states.type";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Popover from "@material-ui/core/Popover";
import CircularProgress from "@material-ui/core/CircularProgress";
import { TensorMetadata } from "./TensorHeatmap";
import RadarChartDrawer, { RadarData } from "./RadarChartDrawer"
import { fetchNodeTensor } from "../../api/layerlevel";
import { useGlobalStates } from "../../store/global-states";

export interface RadarChartProps {
  tensorMetadata: TensorMetadata;
  isShowing: boolean;
  anchorPosition: { top: number, left: number };
  setIsShowing: (boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const RadarChart: React.FC<RadarChartProps> = (
  props: RadarChartProps
) => {
  const classes = useStyles();
  const { tensorMetadata, isShowing, setIsShowing, anchorPosition } = props;
  const { type, step, dataIndex, nodeId } = tensorMetadata;
  const isValid = type !== null && step != null && dataIndex !== null;
  const show = isValid && isShowing;
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [radarChartData, setRadarChartData] = useState(null);
  const handleClose = () => {
    setIsShowing(false);
  };
  const {
    currentMSGraphName
  } = useGlobalStates();

  useEffect(() => {
    if (!show) return;
    let typeParam;
    if (type === ShowActivationOrGradient.ACTIVATION) {
      typeParam = "activation";
    }
    if (type === ShowActivationOrGradient.GRADIENT) {
      typeParam = "gradient";
    }

    setShowLoading(true);
    fetchNodeTensor({
      graph_name: currentMSGraphName,
      node_id: nodeId,
      step: step,
      data_index: dataIndex,
      type: typeParam,
      mode: "radial",
      dim: 1,
      scale: false
    }).then((res) => {
      if (res.data.message === "success") {
        let rawData = res.data.data;
        console.log(rawData);
        setShowLoading(false);
        setRadarChartData(rawData);
      } else {
        console.log("获取layer数据失败：" + res.data.message);
      }
    })
  }, [type, step, dataIndex, show]);

  return (
    <div>
      <Popover
        open={show}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <div className={classes.paper}>
          <h2 id="transition-modal-title">
            data type:{" "}
            {type === ShowActivationOrGradient.ACTIVATION && "activation"}{" "}
            {type === ShowActivationOrGradient.GRADIENT && "gradient"};
            step:{" "}{step} ;
            {dataIndex >= 0 && type === ShowActivationOrGradient.ACTIVATION && (" data index: " + (dataIndex + 1))}
          </h2>
          {showLoading ?
            <CircularProgress /> :
            <RadarChartDrawer rawData={radarChartData} />
          }
        </div>
      </Popover>
    </div>
  );
};

export default RadarChart;
