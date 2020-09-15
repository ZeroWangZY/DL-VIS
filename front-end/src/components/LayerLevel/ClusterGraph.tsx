import React, { useEffect, useRef, useState, useCallback } from "react";
import TSNE from 'tsne-js';
import * as d3 from 'd3';
import { isFunction } from "util";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { useProcessedGraph } from "../../store/processedGraph";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import TensorHeatmap, {
  TensorHeatmapProps,
  TensorMetadata,
} from "./TensorHeatmap";

interface Props {
  clusterData: Array<Array<number>>;
  clusterStep: number;
  loadingDetailLineChartData: boolean;
  loadingClusterData: boolean;
  dataArrToShow: Array<Array<number>>;
  start_step: number;
  end_step: number;
  setClusterStep: { (number): void };
  childNodeId: string | null;
  showLoading: boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
}));

const ClusterGraph: React.FC<Props> = (props: Props) => {
  const {
    clusterData,
    clusterStep,
    loadingDetailLineChartData,
    loadingClusterData,
    start_step,
    end_step,
    dataArrToShow,
    setClusterStep,
    childNodeId,
    showLoading } = props;
  const classes = useStyles();
  const svgRef = useRef();
  const [anchorPosition, setAnchorPosition] = useState<{ top: number, left: number }>(null); // popover的位置
  const titleAreaHeight = 16 // graphHeight * 0.1;
  // const chartAreaHeight = graphHeight - titleAreaHeight;

  // const margin = { left: 10, right: 10, top: 5, bottom: 5 }; // 整个cluster与外层之间的margin
  // const clusterWidth = graphWidth - margin.left - margin.right;
  // const clusterHeight = chartAreaHeight - margin.top - margin.bottom;
  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;
  const { selectedNodeId, showActivationOrGradient } = useGlobalStates();

  const [selectedTensor, setSelectedTensor] = useState<TensorMetadata>({
    type: showActivationOrGradient,
    step: null,
    dataIndex: null,
    nodeId: null
  });
  const [isShowingTensorHeatmap, setIsShowingTensorHeatmap] = useState<boolean>(
    false
  );

  // new 
  const containerHeight = 310;
  const [containerWidth, setContainerWidth] = useState(260);

  const margin = { left: 40, right: 40, top: 10, bottom: 25 }; // cluster graph画布 外层 的div 更外层div之间的便宜偏移
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setContainerWidth(node.getBoundingClientRect().width);
    }
  }, []);
  let clusterGraphContainerHeight = containerHeight - margin.top - margin.bottom - titleAreaHeight;
  let clusterGraphContainerWidth = containerWidth - margin.left - margin.right;

  const margin2 = { left: 4, top: 4 };
  let clusterGraphHeight = clusterGraphContainerHeight - margin2.top * 2;
  let clusterGraphWidth = clusterGraphContainerWidth - margin2.left * 2;

  useEffect(() => {
    if (loadingDetailLineChartData || loadingClusterData) return;
    if (!clusterData || clusterData.length === 0 || !clusterStep) return;

    const dataset = clusterData;
    // 以下是绘制散点图
    let svg = d3.select(svgRef.current);
    svg.selectAll("g").remove();

    let minVal_x = d3.min(dataset, (d) => { return d[0] }),
      maxVal_x = d3.max(dataset, (d) => { return d[0] }),
      minVal_y = d3.min(dataset, (d) => { return d[1] }),
      maxVal_y = d3.max(dataset, (d) => { return d[1] });

    const bisect = d3.bisector((d: any) => d.x).left;
    //拿第一组数据查询
    if (dataArrToShow && dataArrToShow.length) {
      const dataExample: any = dataArrToShow[0];

      let xScale = d3.scaleLinear()
        .domain([minVal_x, maxVal_x])
        .range([0, clusterGraphWidth]);

      let yScale = d3.scaleLinear()
        .domain([minVal_y, maxVal_y])
        .range([clusterGraphHeight, 0]);

      //绘制圆
      let circle = svg.selectAll("g")
        .data(dataset)
        .enter()
        .append("g")
        .attr('transform', (d) => {
          let left = margin2.left + xScale(d[0]);
          let top = yScale(d[1]) + margin2.top;
          if (left >= clusterGraphWidth - 2) {
            left = clusterGraphWidth - 2;
          }
          return `translate(${left}, ${top})`;
        })
        .append('circle')
        .attr("class", "cluster-circle")
        .attr("r", 2)
        .on("mouseover", function (d, i) {  //hover
          d3.select(this).attr("r", 5);
          const g = d3.select(this.parentNode);
          if (g.select('text').size() === 1) {
            g.select('text').transition().duration(500).style('visibility', 'visible');
          }
          else {
            const text: any = g.append('text')
              .text(`(${i})`)
              .style('font-size', 14)
              .style('visibility', 'visible');
            const { width, height } = text.node().getBoundingClientRect();

            let x = 10;
            let y = 0;
            // 判断text的位置是否超出svg的边界
            // x边界的处理
            if (margin2.left + xScale(d[0]) + Math.ceil(width) + 10 >= clusterGraphWidth) {
              x = -(Math.ceil(width) + 10);
            }
            // y边界的处理
            if (yScale(d[1]) + margin2.top <= Math.ceil(height)) {
              y = (Math.ceil(height) + 5 - yScale(d[1]) - margin2.top);
            }
            text.attr("x", x).attr("y", y);
          }
        })
        .on("mouseout", function (d, i) {
          d3.select(this).transition().duration(500).attr("r", 2);
          const g = d3.select(this.parentNode);
          g.select('text').transition().duration(500).style('visibility', 'hidden');
        })
        .on('click', function (d, i) {
          const mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
          const mouseY = d3.mouse((this as any) as SVGSVGElement)[1];

          let x = xScale.invert(mouseX);
          let _index = bisect(dataExample.data, x, 1);
          const batchSize =
            dataExample.data.length / (end_step - start_step + 1);
          let step = Math.floor(start_step + _index / batchSize);
          _index %= batchSize;
          setSelectedTensor({
            type: showActivationOrGradient,
            step: step,
            dataIndex: i,
            nodeId: childNodeId
          });

          setAnchorPosition({ top: d3.event.clientY, left: d3.event.clientX });
          setIsShowingTensorHeatmap(true);
        })
    }

  }, [clusterData, clusterStep, containerWidth, loadingDetailLineChartData, loadingClusterData])

  return (
    <div className="layerLevel-cluster-container" ref={measuredRef} style={{ height: containerHeight }}>

      <div
        className="layerLevel-detailInfo-title"
        style={{
          height: titleAreaHeight + "px",
          width: "100%",
          fontSize: "14px"
        }}>
        <span>
          {"投影图(" + `${nodeMap[selectedNodeId].displayedName}` + " 迭代: " + `${clusterStep}` + ")"}
        </span>
      </div>

      <div
        className="layerLevel-cluster-graph"
        style={{
          position: "relative",
          left: margin.left,
          top: margin.top,
          height: clusterGraphContainerHeight,
          width: clusterGraphContainerWidth,
        }}>
        {(!loadingDetailLineChartData && !loadingClusterData) ?
          (
            <svg
              style={{ height: clusterGraphContainerHeight + "px", width: clusterGraphContainerWidth + "px" }}
              ref={svgRef}>
            </svg>
          ) :
          (
            <div className={classes.paper}
              style={{
                height: clusterGraphContainerHeight,
                background: "rgba(0,0,0,0.1)",
              }}>
              <CircularProgress size={60} />
            </div>
          )
        }
      </div>
      <TensorHeatmap
        tensorMetadata={selectedTensor}
        isShowing={isShowingTensorHeatmap}
        setIsShowing={setIsShowingTensorHeatmap}
        anchorPosition={anchorPosition}
      />
    </div>
  );
}

export default ClusterGraph;