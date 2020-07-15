import React, { useEffect, useState, useRef, useCallback } from "react";
import * as d3 from 'd3';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType, LayerLevelCheckBoxState } from "../../store/global-states.type";
import { Point, DataToShow } from "./LaylerLevel"

interface Props {
  activationOrGradientData: DataToShow[],
  is_training: boolean,
  max_step: number
}
// TODO: 在调用此组件的时候就告诉它准确的宽和高。
const ActivationOrGradientChart: React.FC<Props> = (props: Props) => {
  const { activationOrGradientData, is_training, max_step } = props;

  const [svgWidth, setSvgWidth] = useState(650);
  const [svgHeight, setSvgHeight] = useState(162);
  const [clickNumber, setClickNumber] = useState(null);
  const svgRef = useRef();
  const [cursorLinePos, setCursorLinePos] = useState(null);
  const { layerLevel_checkBoxState } = useGlobalStates();

  const [dataArrToShow, setDataArrToShow] = useState(activationOrGradientData);
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgWidth(node.getBoundingClientRect().width - 50);
      setSvgHeight(node.getBoundingClientRect().height - 10);
    }
  }, []);

  const margin = { top: 10, left: 30, bottom: 10, right: 30 };
  const gapHeight = 20; // 上下折线图之间的距离
  const height = (svgHeight - margin.top - margin.bottom - gapHeight * 2) * 3 / 4;
  const margin2 = { top: height + margin.top + gapHeight, left: 30 };
  const height2 = (svgHeight - margin.top - margin.bottom - gapHeight * 2) * 1 / 4; // height2是height的1/4
  // console.log(height, height2)

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

    let dataSlice = [];
    Object.values(newcheckBoxState).forEach((state, i) => {
      if (state) dataSlice.push(activationOrGradientData[i]);
    })
    setDataArrToShow(dataSlice);
    modifyGlobalStates(
      GlobalStatesModificationType.SET_LAYERLEVEL_CHECKBOXSTATE,
      newcheckBoxState
    );
  }

  useEffect(() => {
    computeAndDrawLine();
  }, [layerLevel_checkBoxState, dataArrToShow]);

  const computeAndDrawLine = async () => {
    if (!is_training || !max_step || dataArrToShow.length === 0) return;
    // 首先清除上一次的svg绘制结果。
    // 因为当dataArrToShow为空的时候，没有任何绘制，但是也要将原来的绘制结果删除
    // 所以把这一段代码放在 if(dataArrToShow.length === 0) 之前
    let focus = d3.select(svgRef.current).select("g.layerLevel-lineChart-focus");
    focus.selectAll(".axis--y").remove(); // 清除原来的坐标
    focus.selectAll(".axis--x").remove(); // 清除原来的坐标
    focus.selectAll(".area").remove(); // 清除原折线图

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
      .call(d3.axisLeft(focusAreaYScale).ticks(5).tickSize(3).tickPadding(2));


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
      .select("rect.layerLevel-lineChart-zoom")
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
      });
  };

  return (
    <div className="layerLevel-lineChart-container" ref={measuredRef}>
      <div style={{ height: "5%", width: "100%" }}>
        <input type="checkbox" style={{ backgroundColor: "#C71585" }} checked={layerLevel_checkBoxState.showMax} onChange={handleChange} name="showMax"></input>
        <label >max</label>
        <input type="checkbox" style={{ backgroundColor: "#DC143C" }} checked={layerLevel_checkBoxState.showMin} onChange={handleChange} name="showMin"></input>
        <label >min</label>
        <input type="checkbox" style={{ backgroundColor: "#4B0082" }} checked={layerLevel_checkBoxState.showMean} onChange={handleChange} name="showMean"></input>
        <label >mean</label>

      </div>
      <svg style={{ height: "95%", width: "100%" }} ref={svgRef}>
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
        </g>
        <g
          className="layerLevel-lineChart-context"
          transform={`translate(${margin2.left},${margin2.top})`}
        ></g>
        <rect
          className="layerLevel-lineChart-zoom"
          width={svgWidth}
          height={height}
          transform={`translate(${margin.left},${margin.top})`}
        />
      </svg>
    </div>
  );
}
export default ActivationOrGradientChart;