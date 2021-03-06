import React, { useEffect, useState } from "react";
import { ShowActivationOrGradient } from "../../store/global-states.type";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import Popover from "@material-ui/core/Popover";
import CircularProgress from "@material-ui/core/CircularProgress";
import { fetchTensorHeatmapBase64 } from "../../api/layerlevel";

export interface TensorMetadata {
  type: ShowActivationOrGradient | null;
  nodeId: string | null;
  step: number | null;
  dataIndex: number | null;
}

export interface TensorHeatmapProps {
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

const TensorHeatmap: React.FC<TensorHeatmapProps> = (
  props: TensorHeatmapProps
) => {
  const classes = useStyles();
  const { tensorMetadata, isShowing, setIsShowing, anchorPosition } = props;
  const { type, step, dataIndex, nodeId } = tensorMetadata;
  const isValid = type !== null && step != null && dataIndex !== null;
  const show = isValid && isShowing;
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const handleClose = () => {
    setIsShowing(false);
  };

  useEffect(() => {
    if (!show) return;
    setShowLoading(true);
    let typeParam;
    if (type === ShowActivationOrGradient.ACTIVATION) {
      typeParam = "activation";
    }
    if (type === ShowActivationOrGradient.GRADIENT) {
      typeParam = "gradient";
    }
    fetchTensorHeatmapBase64({
      graph_name: "alexnet",
      node_id: nodeId,
      type: typeParam,
      step: step,
      data_index: dataIndex,
    }).then((res) => {
      if (res.data.message === "success") {
        setImgSrc(res.data.data);
        setShowLoading(false);
      } else console.warn("获取张量热力图失败: " + res.data.message);
    });
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
            {type === ShowActivationOrGradient.GRADIENT && "gradient"}; step:{" "}
            {step} ; data index: {dataIndex}
          </h2>
          {showLoading && <CircularProgress />}
          {imgSrc && !showLoading && <img src={imgSrc} />}
        </div>
      </Popover>
    </div>
  );
};

export default TensorHeatmap;
