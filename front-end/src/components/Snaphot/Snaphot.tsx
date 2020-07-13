import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import * as d3 from "d3";
import "./Snaphot.css";
import { fetchAndComputeSnaphot, fetchAndComputeModelScalars } from "../../common/model-level/snaphot";
import { computeXYScales, linearScale, generateSeriesAxis } from "../LineCharts/src/computed";
import { modifyGlobalConfigurations } from "../../store/global-configuration";
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { withStyles } from '@material-ui/core/styles';
interface Point {
  x: number;
  y: number;
}
interface checkBoxState {
  checkedA: boolean;
  checkedB: boolean;
  checkedC: boolean;
  checkedD: boolean;
  checkedE: boolean;
}

const Snaphot: React.FC = () => {
  const svgRef = useRef();

  const [svgWidth, setSvgWidth] = useState(1800);

  const dataVariety = ["train loss", "test loss", "train accuracy", "test accuracy", "learning rate"];

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const svgHeight = 300;
  const [clickNumber, setClickNumber] = useState(null);
  const [checkBoxState, setcheckBoxState] = useState({
    checkedA: true,
    checkedB: true,
    checkedC: true,
    checkedD: true,
    checkedE: true,
  });

  //trainLoss, testLoss,trainAccuracy ,testAccuracy,learningRate;
  const handleChange = (event) => { // checkBox状态控制
    let newcheckBoxState = {} as checkBoxState;

    // 保证至少有一个checkBox被选中
    let stateArr = Object.values(checkBoxState);
    let count = 0;
    for (let state of stateArr) {
      if (state) count++;
      if (count > 1) break;
    }
    if (count === 1 && !event.target.checked) return;

    Object.assign(newcheckBoxState,
      { ...checkBoxState, [event.target.name]: event.target.checked });
    setcheckBoxState(newcheckBoxState);
  }

  const { currentMSGraphName, is_training, max_step } = useGlobalStates();

  const margin = { top: 20, right: 20, bottom: 110, left: 40 };
  const margin2 = { top: 230, right: 20, bottom: 30, left: 40 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;
  const height2 = svgHeight - margin2.top - margin2.bottom;

  useEffect(() => {
    computeAndDrawLine();
  }, [is_training, max_step, currentMSGraphName, checkBoxState]);

  const computeAndDrawLine = async () => {
    if (!is_training || !max_step) return;

    const dataArr = await fetchAndComputeModelScalars(currentMSGraphName, 1, max_step);

    // 将要显示的数据拿出来
    let dataArrToShow = [];
    let checkBoxNames = Object.keys(checkBoxState);
    for (let i = 0; i < checkBoxNames.length; i++) {
      let checkBoxName = checkBoxNames[i];
      if (checkBoxState[checkBoxName])
        dataArrToShow.push(dataArr[i]);
    }

    // 首先清除上一次的svg绘制结果。
    // 因为当dataArrToShow为空的时候，没有任何绘制，但是也要将原来的绘制结果删除
    // 所以把这一段代码放在 if(dataArrToShow.length === 0) 之前
    let focus = d3.select(svgRef.current).select("g.focus");
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标
    focus.selectAll(".area").remove(); // 清除原折线图

    let context = d3.select(svgRef.current).select("g.context");
    context.selectAll(".axis--x").remove(); // 清除原来的坐标
    context.selectAll(".axis--y").remove(); // 清除原来的坐标
    context.selectAll(".area").remove(); // 清除原折线图
    context.selectAll(".brush").remove();

    if (dataArrToShow.length === 0) return;
    //到此，所有要显示的折线图数据都在dataArrToShow里面了。

    let minY = Infinity, maxY = -Infinity; // 二维数组中的最大最小值
    for (let i = 0; i < dataArrToShow.length; i++) {
      let LineData: Point[] = dataArrToShow[i].data;
      for (let j = 1; j < max_step; j++) {
        let point: Point = LineData[j];
        if (!point) continue;
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    }
    // const data = await fetchAndComputeSnaphot();

    let XScale = d3.scaleLinear()
      .rangeRound([0, svgWidth])
      .domain([1, max_step]);

    let focusAreaYScale = d3.scaleLinear()
      .rangeRound([height, 0])
      .domain([minY, maxY]);

    let contextAreaYScale = d3.scaleLinear()
      .rangeRound([height2, 0])
      .domain([minY, maxY]);

    const focusAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => XScale(d.x))
      .y((d) => focusAreaYScale(d.y))

    const contextAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => XScale(d.x))
      .y((d) => contextAreaYScale(d.y))

    for (let i = 0; i < dataArrToShow.length; i++) {
      let data = dataArrToShow[i];
      focus
        .append("path")
        .datum(data.data)
        .attr("class", "area")
        .attr("d", focusAreaLineGenerator)
        .attr("fill", "none")
        .attr("stroke", data.color);
    }

    focus
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(XScale));

    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(focusAreaYScale));


    for (let i = 0; i < dataArrToShow.length; i++) {
      let data = dataArrToShow[i];
      context
        .append("path")
        .datum(data.data)
        .attr("class", "area")
        .attr("d", contextAreaLineGenerator)
        .attr("fill", "none")
        .attr("stroke", data.color);
    }

    context
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(d3.axisBottom(XScale));

    const brushed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      let s = d3.event.selection || XScale.range();
      XScale.domain(
        s.map(XScale.invert, XScale)
      );
      let focus = d3.select(svgRef.current).select("g.focus");
      focus.select(".area").attr("d", focusAreaLineGenerator);
      focus.select(".axis--x").call(d3.axisBottom(XScale));
    };

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [svgWidth, height2],
      ])
      .on("brush end", brushed);

    context
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, XScale.range());

    d3.select(svgRef.current)
      .select("rect.zoom")
      .on("mousemove", function () {
        let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
        let x = XScale.invert(mouseX);
        const bisect = d3.bisector((d: any) => d.x).left;
        //拿第一组数据查询
        const data = dataArrToShow[0];
        let _index = bisect(data.data, x, 1);
        let index =
          x - data.data[_index - 1].x > data.data[_index].x - x
            ? _index
            : _index - 1;
        let clickNumber = data.data[index].x;
        setClickNumber(XScale(clickNumber));
      })
      .on("mouseleave", function () {
        setClickNumber(null);
      })
      .on("onclick", function () {
        modifyGlobalStates(
          GlobalStatesModificationType.SET_CURRENT_STEP,
          XScale.invert(clickNumber)
        );
      });
  };

  return (
    <div className="lineChart-container" ref={measuredRef}>
      {/* <h2>The above header is {Math.round(svgWidth)}px tall</h2> */}
      <div style={{ height: "5%", width: "100%" }}>
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox style={{ color: "#C71585" }} checked={checkBoxState.checkedA} onChange={handleChange} name="checkedA" />}
            label="train loss"
          />
          <FormControlLabel
            control={<Checkbox style={{ color: "#DC143C" }} checked={checkBoxState.checkedB} onChange={handleChange} name="checkedB" />}
            label="test loss"
          />
          <FormControlLabel
            control={<Checkbox style={{ color: "#4B0082" }} checked={checkBoxState.checkedC} onChange={handleChange} name="checkedC" />}
            label="train accuracy"
          />
          <FormControlLabel
            control={<Checkbox style={{ color: "#0000FF" }} checked={checkBoxState.checkedD} onChange={handleChange} name="checkedD" />}
            label="test accuracy"
          />
          <FormControlLabel
            control={<Checkbox style={{ color: "#32CD32" }} checked={checkBoxState.checkedE} onChange={handleChange} name="checkedE" />}
            label="learning rate"
          />
        </FormGroup>
      </div>
      <svg style={{ height: "95%", width: "100%" }} ref={svgRef}>
        <defs>
          <clipPath id={"clip"}>
            <rect width={svgWidth} height={height} />
          </clipPath>
        </defs>
        <g
          className="focus"
          transform={`translate(${margin.left},${margin.top})`}
        >
          {clickNumber !== null && (
            <line
              x1={clickNumber}
              x2={clickNumber}
              y1={height}
              y2={15}
              style={{
                stroke: "grey",
                strokeWidth: 1,
              }}
            />
          )}
        </g>
        <g
          className="context"
          transform={`translate(${margin2.left},${margin2.top})`}
        ></g>
        <rect
          className="zoom"
          width={svgWidth}
          height={height}
          transform={`translate(${margin.left},${margin.top})`}
        />
      </svg>
    </div>
  );
};

export default Snaphot;
