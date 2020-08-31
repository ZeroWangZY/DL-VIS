import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useGlobalStates } from "../../store/global-states";
import { useGlobalConfigurations } from "../../store/global-configuration";
import { Point, DataToShow } from "./LayerLevel";
import "./ActivationOrGradientChart.css";
import { useProcessedGraph } from "../../store/processedGraph";
import TensorHeatmap, {
  TensorHeatmapProps,
  TensorMetadata,
} from "./TensorHeatmap";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

interface Props {
  dataArrToShow: Array<Array<number>>;
  start_step: number;
  end_step: number;
  setClusterStep: { (number): void };
  minValueOfDataToShow: number;
  maxValueOfDataToShow: number;
  childNodeId: string | null;
  showLoading: boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    marginLeft: "40px",
  },
}));

const DetailLineChart: React.FC<Props> = (props: Props) => {
  const classes = useStyles();

  const {
    start_step,
    end_step,
    dataArrToShow,
    setClusterStep,
    maxValueOfDataToShow,
    minValueOfDataToShow,
    childNodeId,
    showLoading
  } = props;

  const {
    max_step,
    selectedNodeId,
    showActivationOrGradient,
  } = useGlobalStates();

  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;

  const svgRef = useRef();
  const [anchorPosition, setAnchorPosition] = useState<{ top: number, left: number }>(null); // popover的位置
  const [svgWidth, setSvgWidth] = useState(650);
  const [svgHeight, setSvgHeight] = useState(140);
  const [selectedTensor, setSelectedTensor] = useState<TensorMetadata>({
    type: showActivationOrGradient,
    step: null,
    dataIndex: null,
    nodeId: null
  });
  const [isShowingTensorHeatmap, setIsShowingTensorHeatmap] = useState<boolean>(
    false
  );
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgWidth(node.getBoundingClientRect().width);
      setSvgHeight(node.getBoundingClientRect().height);
    }
  }, []);

  const titleAreaHeight = svgHeight * 0.1;
  const chartAreaHeight = svgHeight - titleAreaHeight;

  const margin = { top: 15, left: 40, bottom: 5, right: 40 }; // chart与外层之间的margin
  const chartHeight = chartAreaHeight - margin.top - margin.bottom; // chart的高度
  const chartWidth = svgWidth - margin.left - margin.right;

  useEffect(() => {
    if (showLoading) return;
    if (start_step < 0 || end_step < 0 || !start_step || !end_step) return;
    if (!dataArrToShow || dataArrToShow.length === 0) return;
    // console.log(start_step, end_step);

    DrawLineChart(minValueOfDataToShow, maxValueOfDataToShow, dataArrToShow);
  }, [dataArrToShow, minValueOfDataToShow, maxValueOfDataToShow, svgWidth, showLoading]);

  const DrawLineChart = (minValue, maxValue, dataArrToShow) => {
    const totalSteps = end_step - start_step + 1;
    const ticksBetweenTwoSteps = dataArrToShow[0].data.length / totalSteps;

    const svg = d3.select(svgRef.current);
    let focus = svg.select("g.layerLevel-detailInfo-focus");
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标
    focus.selectAll(".layerLevel-detailInfo-area").remove(); // 清除原折线图
    focus.selectAll(".detailLineChart-grid").remove();
    svg.selectAll(".layerLevel-detailInfo-text").remove();
    svg.selectAll(".layerLevel-detailInfo-yAxisLine").remove();

    const bisect = d3.bisector((d: any) => d.x).left;
    //拿第一组数据查询
    const dataExample = dataArrToShow[0];

    let xScale = d3
      .scaleLinear()
      .range([0, chartWidth])
      .domain([0, dataArrToShow[0].data.length]);

    let yScale = d3
      .scaleLinear()
      .range([chartHeight, 0])
      .domain([minValue as Number, maxValue as Number]);

    const focusAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y));

    svg.select(".layerLevel-detailInfo-zoom").on("click", function () {
      let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
      let x = xScale.invert(mouseX);

      let _index = bisect(dataExample.data, x, 1);
      setClusterStep(Math.floor(_index / ticksBetweenTwoSteps) + start_step);
    });

    // function toTopLevel(targetElement: SVGSVGElement) {
    //   let parent = targetElement.parentNode;
    //   parent.appendChild(targetElement);
    // }

    for (let idx = 0, len = dataArrToShow.length; idx < len; idx++) {
      let data = dataArrToShow[idx];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "layerLevel-detailInfo-area")
        .attr("d", focusAreaLineGenerator)
        .attr("stroke", data.color)
        .on("mouseover", function (d) {
          // toTopLevel((this as any) as SVGSVGElement);
          d3.select(this).raise(); // 将高亮的折线显示在最上层。

          d3.select(this).attr("stroke", "red");
          d3.select(this).classed("hovered", true);

          const mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
          const mouseY = d3.mouse((this as any) as SVGSVGElement)[1];
          let x = xScale.invert(mouseX);
          let _index = bisect(dataExample.data, x, 1);
          const batchSize =
            dataExample.data.length / (end_step - start_step + 1);
          let step = Math.floor(start_step + _index / batchSize);
          getLineInfoLabel(xScale(_index), mouseY, idx, step, _index % batchSize);
        })
        .on("click", function (d) {
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
            dataIndex: _index,
            nodeId: childNodeId
          });

          setAnchorPosition({ top: d3.event.clientY, left: d3.event.clientX });
          setIsShowingTensorHeatmap(true);
        })
        .on("mouseout", function (d) {
          d3.select(this).attr("stroke", data.color);
          d3.select(this).classed("hovered", false);

          focus.selectAll(".layerLevel-detailInfo-area-text").remove();
        });
    }

    function getLineInfoLabel(xPos, yPos, i, step, index) {
      // 在(x,y)位置画一个信息框，里面是index
      focus.selectAll(".layerLevel-detailInfo-area-text").remove();

      focus
        .append("text")
        .attr("class", "layerLevel-detailInfo-area-text")
        .attr("x", xPos)
        .attr("y", yPos)
        .text(`(step: ${step}, index: ${index})`)
        .style("font-size", 14)
        .style("visibility", "visible");
    }

    // 需要竖线数量：刷选得到的数据范围是：[start_step, Math.min(end_step, max_step-1)]
    // 坐标刻度为 ： start_step , .... Math.min(end_step, max_step-1)
    // Math.min(end_step, max_step-1) === start_step时，不画线，直接标上值

    svg
      .append("text")
      .attr("class", "layerLevel-detailInfo-text")
      .text(`${start_step}`)
      .attr("x", margin.left)
      .attr("y", margin.top - 2)
      .attr("text-anchor", "middle");

    if (Math.min(end_step, max_step - 1) !== start_step) {
      let numberOfLineToDraw = Math.min(end_step, max_step - 1) - start_step; // 比如[345,346],还需要画1根线
      let widthBetweenToLines = chartWidth / (numberOfLineToDraw + 1);

      for (let i = 1; i <= numberOfLineToDraw; i++) {
        let xPos = margin.left + widthBetweenToLines * i;
        // 长度为 chartHeight
        svg
          .append("text")
          .attr("class", "layerLevel-detailInfo-text")
          .text(`${start_step + i}`)
          .attr("x", xPos)
          .attr("y", margin.top - 2)
          .attr("text-anchor", "middle");

        svg
          .append("line")
          .attr("class", "layerLevel-detailInfo-yAxisLine")
          .attr("x1", xPos)
          .attr("y1", margin.top)
          .attr("x2", xPos)
          .attr("y2", margin.top + chartHeight);
      }
    }
    focus.append("g").attr("class", "axis axis--y").call(d3.axisLeft(yScale));

    let yGrid = focus.append("g").attr("class", "detailLineChart-grid");
    yGrid.selectAll("path.domain").remove(); // 删除横线。
  };

  return (
    <div
      className="layerLevel-detailInfo-container"
      ref={measuredRef}
      style={{ userSelect: "none", height: "100%" }}
    >
      <div
        className="layerLevel-detailInfo-title"
        style={{
          height: titleAreaHeight + "px",
          position: "relative",
          left: margin.left,
          fontSize: "14px",
        }}
      >
        <span>
          {"数据实例指标变化图 (层: " +
            `${nodeMap[selectedNodeId].displayedName}` +
            " 迭代: " +
            `${start_step}` +
            "-" +
            `${end_step}` +
            ")"}
        </span>
      </div>

      {showLoading && (
        <div className={classes.paper}
          style={{ height: chartHeight, marginLeft: margin.left }}>
          <h2>
            正在获取数据实例指标变化图数据
          </h2>
          {showLoading && <CircularProgress />}
        </div>
      )}

      {!showLoading && (
        <svg
          style={{ height: chartAreaHeight + "px", width: "100%" }}
          ref={svgRef}
        >
          <g>
            <rect
              className="layerLevel-detailInfo-zoom"
              width={chartWidth}
              height={chartHeight}
              transform={`translate(${margin.left},${margin.top})`}
            />
          </g>
          <g
            className="layerLevel-detailInfo-focus"
            transform={`translate(${margin.left},${margin.top})`}
          ></g>
        </svg>
      )}
      <TensorHeatmap
        tensorMetadata={selectedTensor}
        isShowing={isShowingTensorHeatmap}
        setIsShowing={setIsShowingTensorHeatmap}
        anchorPosition={anchorPosition}
      />
    </div>
  );
};
export default DetailLineChart;
