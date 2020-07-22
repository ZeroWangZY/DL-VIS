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
  // const dataVariety = ["train loss", "test loss", "train accuracy", "test accuracy", "learning rate"];
  const svgHeight = 300;
  const [cursorLinePos, setCursorLinePos] = useState(null);
  const [checkBoxState, setcheckBoxState] = useState({
    checkedA: true,
    checkedB: false,
    checkedC: false,
    checkedD: false,
    checkedE: false,
  });
  const [DetailInfoOfCurrentStep, setDetailInfoOfCurrentStep] = useState([]);
  const { currentStep, currentMSGraphName, is_training, max_step } = useGlobalStates();

  const margin = { top: 20, right: 20, bottom: 110, left: 40 };
  const margin2 = { top: 220, right: 20, bottom: 40, left: 40 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;
  const height2 = svgHeight - margin2.top - margin2.bottom;

  let XScale = d3.scaleLinear()
    .rangeRound([0, svgWidth])
    .domain([1, max_step]);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgWidth(node.getBoundingClientRect().width - 100);
    }
  }, []);


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

  useEffect(() => {
    computeAndDrawLine();
  }, [is_training, max_step, currentMSGraphName, checkBoxState, svgWidth]);

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
    focus.selectAll(".snapshot-grid").remove();

    let context = d3.select(svgRef.current).select("g.context");
    context.selectAll(".axis--x").remove(); // 清除原来的坐标
    context.selectAll(".axis--y").remove(); // 清除原来的坐标
    context.selectAll(".area").remove(); // 清除原折线图
    context.selectAll(".brush").remove();

    if (dataArrToShow.length === 0) return;
    //到此，所有要显示的折线图数据都在dataArrToShow里面了。

    const bisect = d3.bisector((d: any) => d.x).left;
    //拿第一组数据查询
    const dataExample = dataArrToShow[0];

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


    // add the X gridlines
    focus.append("g")
      .attr("class", "snapshot-grid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(XScale).tickSize(-height))
      .selectAll("text")
      .style("opacity", "0")

    // add the Y gridlines
    focus.append("g")
      .attr("class", "snapshot-grid")
      .call(d3.axisLeft(focusAreaYScale).tickSize(-svgWidth))
      .selectAll("text")
      .style("opacity", "0")

    // 以下是context部分的折线图
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

    // brush部分

    const zoomed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      var t = d3.event.transform;
      let newXScale = d3.scaleLinear()
        .rangeRound([0, svgWidth])
        .domain(t.rescaleX(XScale).domain());

      focus.select(".focus").attr("d", focusAreaLineGenerator);
      // focus.select(".axis--x").call(d3.axisBottom(newXScale));

      console.log(newXScale.range().map(t.invertX, t));
      context.select(".brush")
        .call(brush.move, newXScale.range().map(t.invertX, t));
    }

    let zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [svgWidth, height]])
      .extent([[0, 0], [svgWidth, height]])
    // .on("zoom", zoomed);

    const brushed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      let s = d3.event.selection || XScale.range();
      // console.log(s.map(XScale.invert, XScale));
      let newXScale = d3.scaleLinear()
        .rangeRound([0, svgWidth])
        .domain(s.map(XScale.invert, XScale));

      // focus.select(".focus").attr("d", focusAreaLineGenerator);

      focus.select(".axis--x").call(d3.axisBottom(newXScale));

      d3.select(svgRef.current)
        .select(".zoom")
        .call(zoom.transform, d3.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0))
    };

    const brush = d3.brushX()
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
        let _index = bisect(dataExample.data, x, 1);

        // 因为data中是[1, max_step]的数组,共max_step-1个数
        // 而数组从0开始存储，所以数组中是[0, max_step-1)
        // 所以_index最大是 max_step - 2
        if (_index === max_step - 1) _index = max_step - 2;
        let index =
          x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
            ? _index
            : _index - 1;
        let clickNumber = dataExample.data[index].x;
        setCursorLinePos(XScale(clickNumber));
        let newDetailInfoOfCurrentStep = [];
        for (let i = 0; i < dataArrToShow.length; i++) {
          newDetailInfoOfCurrentStep.push({
            "name": dataArrToShow[i].id,
            "value": dataArrToShow[i].data[clickNumber - 1].y,
          })
        }
        setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
      })
      .on("mouseleave", function () {
        setCursorLinePos(null);
      })
      .on("click", function () {
        let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
        let x = XScale.invert(mouseX);

        let _index = bisect(dataExample.data, x, 1);

        // 因为data中是[1, max_step]的数组,共max_step-1个数
        // 而数组从0开始存储，所以数组中是[0, max_step-1)
        // 所以_index最大是 max_step - 2
        if (_index === max_step - 1) _index = max_step - 2;
        let index =
          x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
            ? _index
            : _index - 1;
        let clickNumber = dataExample.data[index].x;

        modifyGlobalStates(
          GlobalStatesModificationType.SET_CURRENT_STEP,
          clickNumber
        );
        setCursorLinePos(XScale(clickNumber));
        let newDetailInfoOfCurrentStep = [];
        for (let i = 0; i < dataArrToShow.length; i++) {
          newDetailInfoOfCurrentStep.push({
            "name": dataArrToShow[i].id,
            "value": dataArrToShow[i].data[clickNumber - 1].y,
          })
        }
        setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
      });
  };

  const getDetailInfoRect = (xPos, height) => {
    // return (
    //   <rect
    //     className="detailInfoRect"
    //     width={50}
    //     height={50}
    //     transform={`translate(${xPos},${height / 2})`}
    //   >
    //   </rect>)
    let textHeight = 50
    let textWeight = 100
    return (
      <foreignObject
        x={xPos}
        y={height / 2 - textHeight / 2}
        width={textWeight}
        height={textHeight}
      >
        <div className="DetailInfoContainer">
          {DetailInfoOfCurrentStep.map((d, i) => {
            <span>
              sadf
            </span>
          })}
        </div>
      </foreignObject>
    )
  }

  return (
    <div className="lineChart-container" ref={measuredRef}>
      <div style={{ height: "5%", width: "100%" }}>
        <input type="checkbox" style={{ backgroundColor: "#C71585" }} checked={checkBoxState.checkedA} onChange={handleChange} name="checkedA"></input>
        <label >train loss</label>
        <input type="checkbox" style={{ backgroundColor: "#DC143C" }} checked={checkBoxState.checkedB} onChange={handleChange} name="checkedB"></input>
        <label >test loss</label>
        <input type="checkbox" style={{ backgroundColor: "#4B0082" }} checked={checkBoxState.checkedC} onChange={handleChange} name="checkedC"></input>
        <label >train accuracy</label>
        <input type="checkbox" style={{ backgroundColor: "#0000FF" }} checked={checkBoxState.checkedD} onChange={handleChange} name="checkedD"></input>
        <label >test accuracy</label>
        <input type="checkbox" style={{ backgroundColor: "#32CD32" }} checked={checkBoxState.checkedE} onChange={handleChange} name="checkedE"></input>
        <label >learning rate</label>
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
          {cursorLinePos !== null && (
            <line
              x1={cursorLinePos}
              x2={cursorLinePos}
              y1={height}
              y2={0}
              style={{
                stroke: "grey",
                strokeWidth: 1,
              }}
            />
          )}
          {XScale !== null && currentStep !== null && DetailInfoOfCurrentStep.length &&
            getDetailInfoRect(XScale(currentStep), height)
          }
          {XScale !== null && currentStep !== null && (
            <line
              x1={XScale(currentStep)}
              x2={XScale(currentStep)}
              y1={height}
              y2={0}
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
