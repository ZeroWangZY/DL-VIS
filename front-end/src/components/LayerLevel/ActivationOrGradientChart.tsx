import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from 'd3';
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import {
  useGlobalConfigurations
} from "../../store/global-configuration";
import { makeStyles } from "@material-ui/core/styles";
import { GlobalStatesModificationType, LayerLevelCheckBoxState } from "../../store/global-states.type";
import { Point, DataToShow } from "./LayerLevel"
import "./ActivationOrGradientChart.css"
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from "@material-ui/core/Typography";
import Checkbox from '@material-ui/core/Checkbox';
import { toExponential } from "../Snapshot/Snapshot"
import _ from 'lodash';

interface Props {
  activationOrGradientData: DataToShow[],
  is_training: boolean,
  max_step: number,
  setBrushedStep: { ([]): void };
  setBrushedOrNot: { (boolean): void };
}

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  title: {
    fontSize: 14,
    color: "white",
    textAlign: "left",
  },
});

// TODO: 在调用此组件的时候就告诉它准确的宽和高。
const ActivationOrGradientChart: React.FC<Props> = (props: Props) => {
  const { activationOrGradientData, max_step, setBrushedStep, setBrushedOrNot } = props;
  const { layerLevel_checkBoxState, currentStep } = useGlobalStates();
  const { layerLevelcolorMap } = useGlobalConfigurations();

  const classes = useStyles();

  const svgRef = useRef();
  const zoomRef = useRef();
  const brushGRef = useRef();
  const [svgWidth, setSvgWidth] = useState(650);
  const [svgHeight, setSvgHeight] = useState(162);
  const [cursorLinePos, setCursorLinePos] = useState(null);
  const [localCurrentStep, setLocalCurrentStep] = useState(null);
  const [fixCursorLinePos, setFixCursorLinePos] = useState(null);
  const [dataArrToShow, setDataArrToShow] = useState(activationOrGradientData);
  const [DetailInfoOfCurrentStep, setDetailInfoOfCurrentStep] = useState([]);
  const [showDomain, setShowDomain] = useState(null);
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgWidth(node.getBoundingClientRect().width - 70);
      setSvgHeight(node.getBoundingClientRect().height);
    }
  }, []);

  // let XScale = d3.scaleLinear()
  //   .rangeRound([0, svgWidth])
  //   .domain([1, max_step]);

  const titleAreaHeight = svgHeight * 0.1;
  const chartAreaHeight = svgHeight - titleAreaHeight;

  // 下面这些都是chart Area中的宽高
  const margin = { top: 4, left: 40, bottom: 0, right: 40 };
  const gapHeight = 20; // 上下折线图之间的距离
  const height = (chartAreaHeight - margin.top - margin.bottom - gapHeight * 2) * 5 / 7;
  const margin2 = { top: height + margin.top + gapHeight, left: margin.left };
  const height2 = (chartAreaHeight - margin.top - margin.bottom - gapHeight * 2) * 2 / 7;

  const filterData = (newcheckBoxState) => {
    let dataSlice = [];
    Object.values(newcheckBoxState).forEach((state, i) => {
      if (state) dataSlice.push(activationOrGradientData[i]);
    })
    return dataSlice;
  }

  const handleChange = (event) => { // checkBox状态控制
    let newcheckBoxState = {} as LayerLevelCheckBoxState;

    // 保证至少有一个checkBox被选中
    let stateArr = Object.values(layerLevel_checkBoxState);
    let count = 0;
    for (let state of stateArr) {
      if (state) count++;
      if (count > 1) break;
    }
    if (count === 1 && !event.target.checked) return;

    Object.assign(newcheckBoxState,
      { ...layerLevel_checkBoxState, [event.target.name]: event.target.checked });

    setDataArrToShow(filterData(newcheckBoxState));

    modifyGlobalStates(
      GlobalStatesModificationType.SET_LAYERLEVEL_CHECKBOXSTATE,
      newcheckBoxState
    );
  }

  useEffect(() => {
    setDataArrToShow(filterData(layerLevel_checkBoxState));
  }, activationOrGradientData)

  useEffect(() => {
    computeAndDrawLine();
  }, [dataArrToShow, svgWidth, currentStep]);

  const computeAndDrawLine = async () => {
    if (!max_step || dataArrToShow.length === 0) return;
    // 首先清除上一次的svg绘制结果。
    // 因为当dataArrToShow为空的时候，没有任何绘制，但是也要将原来的绘制结果删除
    // 所以把这一段代码放在 if(dataArrToShow.length === 0) 之前
    let focus = d3.select(svgRef.current).select("g.layerLevel-lineChart-focus");
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标
    focus.selectAll(".area").remove(); // 清除原折线图
    focus.selectAll(".activationOrGradient-grid").remove();
    d3.select(brushGRef.current).selectAll('.focusBrush').remove();

    let context = d3.select(svgRef.current).select("g.layerLevel-lineChart-context");
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

    let x1Scale = d3.scaleLinear()
      .rangeRound([0, svgWidth])
      .domain([1, max_step]);
    let x2Scale = d3.scaleLinear()
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
      .x((d) => x1Scale(d.x))
      .y((d) => focusAreaYScale(d.y))

    const contextAreaLineGenerator = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => x2Scale(d.x))
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
      .call(d3.axisBottom(x1Scale));

    focus
      .append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(focusAreaYScale).ticks(5).tickSize(3).tickPadding(2));

    // add the X gridlines
    // focus.append("g")
    //   .attr("class", "activationOrGradient-grid")
    //   .attr("transform", "translate(0," + height + ")")
    //   .call(d3.axisBottom(x1Scale).tickSize(-height))
    //   .selectAll("text")
    //   .style("opacity", "0")

    // add the Y gridlines
    focus.append("g")
      .attr("class", "activationOrGradient-grid")
      .call(d3.axisLeft(focusAreaYScale).tickSize(-svgWidth))
      .selectAll("text")
      .style("opacity", "0")

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
      .call(d3.axisBottom(x2Scale));

    const brushed = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      let s = d3.event.selection || x2Scale.range();
      x1Scale.domain(s.map(x2Scale.invert, x2Scale));

      if (currentStep)
        setFixCursorLinePos(x1Scale(currentStep));

      setShowDomain(s.map(x2Scale.invert, x2Scale)); // 设定brush选定显示区域的domain;
      // const t1 = focus.transition().duration(750);
      const xAxis: any = d3.axisBottom(x1Scale);
      focus.selectAll(".area").attr("d", focusAreaLineGenerator);
      focus.select(".axis--x").call(xAxis);
    };

    // focus的zoom event
    // const zoomed = () => {
    //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    //   var t = d3.event.transform;
    //   x1Scale.domain(t.rescaleX(x2Scale).domain());
    //   const t1 = focus.transition().duration(750);
    //   const xAxis: any = d3.axisBottom(x1Scale);
    //   focus.selectAll(".area").transition(t1).attr("d", focusAreaLineGenerator);
    //   focus.select(".axis--x").transition(t1).call(xAxis);
    //   const t2 = context.transition().duration(750);
    //   const move: any = brush.move;
    //   context.select(".brush").transition(t2).call(move, x1Scale.range().map(t.invertX, t));
    // }

    // const zoom = d3.zoom()
    //   .scaleExtent([1, Infinity])
    //   .translateExtent([[0, 0], [svgWidth, height]])
    //   .extent([[0, 0], [svgWidth, height]])
    //   .on('zoom', zoomed);

    const brushG: any = brushGRef.current;

    // d3.select(brushG)
    //   .call(zoom);

    const focusBrushStep = 10;

    const focusBrushended = () => {
      const selection = d3.event.selection;
      if (!selection) {
        return;
      }
      let s = selection.slice().map(x1Scale.invert, x1Scale);

      if (Math.abs(s[0] - s[1]) < 1 && Math.floor(s[0]) === Math.floor(s[1])) { // 刷选距离小于1，且中间没有包含任何step
        let begStep = Math.round(s[0]);
        modifyGlobalStates(
          GlobalStatesModificationType.SET_CURRENT_STEP,
          begStep
        );
        s[0] = Math.max(1, begStep); // 不能小于1
        s[0] = Math.min(max_step-1, s[0]); // 不能大于 max_step-1

        s[1] = Math.min(max_step - 1, s[0] + 1); 
      } else {
        s[0] = Math.ceil(s[0]);
        s[1] = Math.floor(s[1]);
        s = s.sort((a, b) => a - b);
        if (s[1] - s[0] > focusBrushStep) {
          s[1] = s[0] + focusBrushStep;
        }
      }
      // console.log('selection: ', s);
      // const tempNewX1Domain = s.map(x1Scale.invert, x1Scale);
      // tempNewX1Domain[0] = Math.ceil(tempNewX1Domain[0]);
      // tempNewX1Domain[1] = Math.floor(tempNewX1Domain[1]);

      // const newX1Domain = tempNewX1Domain.sort((a, b) => a - b);
      // console.log('newX1Domain: ', newX1Domain);
      // if(newX1Domain[1] - newX1Domain[0] <= 1 && d3.event.type === 'end') {
      //   d3.select(brushG).select('.focusBrush').call(focusBrush.move, null);
      //   alert('刷选的起始step与终点step不能小于或等于1');
      //   return ;
      // }

      setBrushedStep(s);
      setBrushedOrNot(true);
      // Test代码
      // let beginPos = Math.floor(Math.random() * 3) + 300;
      // setBrushedStep([beginPos, beginPos + 9]);

      // x1Scale.domain(newX1Domain);
      d3.select(brushG).select('.focusBrush').call(focusBrush.move, null);
      // const xAxis: any = d3.axisBottom(x1Scale);
      // const t1 = focus.transition().duration(750);
      // focus.select(".axis--x").transition(t1).call(xAxis);
      // focus.selectAll(".area").transition(t1).attr("d", focusAreaLineGenerator);
      // const t2 = context.transition().duration(750);
      // const move: any = brush.move;
      // context.select(".brush").transition(t2).call(move, newX1Domain.map(x2Scale));
      brushSelection = [-1, -1];
    };

    const isSameArray = (a, b) => {
      return a[0] === b[0] && a[1] === b[1];
    }

    let brushSelection = [-1, -1];

    const focusBrushHandler = () => {
      const selection = d3.event.selection;

      if (!selection) {
        return;
      }
      let s = selection.slice();
      // 节流
      if (isSameArray(brushSelection, s)) {
        return;
      }
      brushSelection = s;
      s = s.map(x1Scale.invert, x1Scale);
      s[0] = Math.round(s[0] * 10) / 10;
      s[1] = Math.round(s[1] * 10) / 10;
      // s[0] = Math.ceil(s[0]);
      // s[1] = Math.floor(s[1]);
      // s = s.sort((a, b) => a - b);
      if (s[1] - s[0] > focusBrushStep) {
        s[1] = s[0] + focusBrushStep;
      }
      d3.select(brushG).select('.focusBrush').call(focusBrush.move, s.map(x1Scale));
    };

    const focusBrush = d3
      .brushX()
      .extent([
        [0, 0],
        [svgWidth, height],
      ])
      .on('brush', focusBrushHandler)
      .on("end", focusBrushended);

    // 为focus添加brush
    d3.select(brushG).append('g')
      .attr('class', 'focusBrush')
      .call(focusBrush);

    const brush = d3
      .brushX()
      .extent([
        [0, 0],
        [svgWidth, height2],
      ])
      .on("brush end", brushed);

    let showRange = []; // 根据 x2Scale 和 showDomain，推算出 showRange;
    if (showDomain === null)
      showRange = x2Scale.range();
    else
      showRange = [x2Scale(showDomain[0]), x2Scale(showDomain[1])];

    context
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, showRange);

    d3.select(svgRef.current)
      .select(".layerLevel-lineChart-zoom-g")
      .on("mousemove", function () {
        let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
        let x = x1Scale.invert(mouseX);
        let _index = bisect(dataExample.data, x, 1);
        _index = _index === 0 ? 1 : _index;

        // 因为data中是[1, max_step]的数组,共max_step-1个数
        // 而数组从0开始存储，所以数组中是[0, max_step-1)
        // 所以_index最大是 max_step - 2
        if (_index === max_step - 1) _index = max_step - 2;

        if (0 <= (_index - 1) && _index < dataExample.data.length) {
          let index =
            x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
              ? _index
              : _index - 1;
          let clickNumber = dataExample.data[index].x;
          setLocalCurrentStep(clickNumber);
          setCursorLinePos(x1Scale(clickNumber));

          let newDetailInfoOfCurrentStep = [];
          for (let i = 0; i < dataArrToShow.length; i++) {
            newDetailInfoOfCurrentStep.push({
              "name": dataArrToShow[i].id,
              "value": dataArrToShow[i].data[clickNumber - 1].y,
            })
          }
          setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
        }
      })
      .on("mouseleave", function () {
        setLocalCurrentStep(null);
        setCursorLinePos(null);
      })
      .on("click", function () {
        let mouseX = d3.mouse((this as any) as SVGSVGElement)[0];
        let x = x1Scale.invert(mouseX);

        let _index = bisect(dataExample.data, x, 1);
        _index = _index === 0 ? 1 : _index;

        // 因为data中是[1, max_step]的数组,共max_step-1个数
        // 而数组从0开始存储，所以数组中是[0, max_step-1)
        // 所以_index最大是 max_step - 2
        if (_index === max_step - 1) _index = max_step - 2;

        if (0 <= (_index - 1) && _index < dataExample.data.length) {
          let index =
            x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
              ? _index
              : _index - 1;
          let clickNumber = dataExample.data[index].x;
          modifyGlobalStates(
            GlobalStatesModificationType.SET_CURRENT_STEP,
            clickNumber
          );
          setFixCursorLinePos(x1Scale(clickNumber));
        }
      });
  };

  const getDetailInfoRect = (xPos, height) => {
    let fontSize = 14;
    let contextHeight = (fontSize + 2) * (DetailInfoOfCurrentStep.length + 1);// 16 为字体大小
    let contextWidth = 150;

    let containerWidth = contextWidth + 10, containerHeight = contextHeight + 10;

    if (xPos + containerWidth > svgWidth) xPos = xPos - containerWidth - 20; // 靠近右边界，将这一部分放到竖线前面显示
    else xPos += 10;// gap

    return (
      <foreignObject
        x={xPos}
        y={height / 2 - contextHeight / 2 - 10}
        width={containerWidth + 10}
        height={contextHeight + 40}
      >
        <div className="DetailInfoContainer">
          <div className={classes.title} style={{ marginLeft: '23px' }}>
            {"iteration: " + localCurrentStep}
          </div>
          {DetailInfoOfCurrentStep.map((d, i) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="DotBeforeDetailInfo" style={{ background: layerLevelcolorMap.get(d.name), float: 'left' }}></span>
              <div className={classes.title} style={{ display: 'inline-block', float: 'left' }}>
                {d.value === null && (d.name + ": null")}
                {d.value !== null &&
                  (d.name + ": " + toExponential(d.value))
                }
              </div>
              <div style={{ clear: 'both' }}></div>
            </div>
          ))}
        </div>
      </foreignObject>
    )
  };

  return (
    <div className="layerLevel-lineChart-container" ref={measuredRef} style={{ userSelect: 'none', height: "100%" }}>
      {/* <div style={{ display: "inline" }}> */}

      <div className="layerLevel-lineChart-checkbox" style={{ height: titleAreaHeight + "px", width: "70%", position: 'relative', top: "-10px", left: margin.left }}>
        <FormGroup row>
          <FormControlLabel
            control={<Checkbox style={{ color: layerLevelcolorMap.get("max") }} checked={layerLevel_checkBoxState.showMax} onChange={handleChange} name="showMax" />}
            label={<Typography style={{ fontSize: "14px" }}>max</Typography>}
          />
          <FormControlLabel
            control={<Checkbox style={{ color: layerLevelcolorMap.get("min") }} checked={layerLevel_checkBoxState.showMin} onChange={handleChange} name="showMin" />}
            label={<Typography style={{ fontSize: "14px" }}>min</Typography>}

          />
          <FormControlLabel
            control={<Checkbox style={{ color: layerLevelcolorMap.get("mean") }} checked={layerLevel_checkBoxState.showMean} onChange={handleChange} name="showMean" />}
            label={<Typography style={{ fontSize: "14px" }}>mean</Typography>}
          />
        </FormGroup>
      </div>

      <svg style={{ height: chartAreaHeight + "px", width: "100%" }} ref={svgRef}>
        <defs>
          <clipPath id={"clip"}>
            <rect width={svgWidth} height={height} />
          </clipPath>
        </defs>
        <g className="layerLevel-lineChart-zoom-g" transform={`translate(${margin.left},${margin.top})`}>
          <g ref={brushGRef}>
            <rect
              className="layerLevel-lineChart-zoom"
              width={svgWidth}
              height={height}
              ref={zoomRef}
            />
          </g>
        </g>
        <g
          className="layerLevel-lineChart-focus"
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
          {cursorLinePos !== null && DetailInfoOfCurrentStep.length &&
            getDetailInfoRect(cursorLinePos, height)
          }

          {fixCursorLinePos !== null && (
            <line
              x1={fixCursorLinePos}
              x2={fixCursorLinePos}
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
          className="layerLevel-lineChart-context"
          transform={`translate(${margin2.left},${margin2.top})`}
        ></g>
      </svg>
    </div>
  );
}
export default ActivationOrGradientChart;