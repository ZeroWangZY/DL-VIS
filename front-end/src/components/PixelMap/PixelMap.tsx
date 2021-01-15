import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { getTensorHeatmapSequential } from "../../api/layerlevel";

const PixelMap: React.FC = () => {
  const svgRef = useRef();
  const [rawData, setRawData] = useState(null);

  const [svgHeight, setSvgHeight] = useState(280);
  const [svgWidth, setSvgWidth] = useState(1800);

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setSvgHeight(node.getBoundingClientRect().height);
      setSvgWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const margin = { top: 10, left: 30, bottom: 10, right: 30 };
  const gapHeight = 20; // 上下热力图之间的距离
  const width = svgWidth - margin.left - margin.right;
  const height = (svgHeight - margin.top - margin.bottom - gapHeight * 2) * 5 / 6;
  const margin2 = { top: height + margin.top + gapHeight, left: margin.left };
  const height2 = (svgHeight - margin.top - margin.bottom - gapHeight * 2) * 1 / 6; // 上下热力图图比例是 5: 1

  const samplingDataLength = 500; // 采样过后数据的长度
  const startStep = 1, endStep = 1510;

  useEffect(() => {
    getTensorHeatmapSequential({
      start_step: startStep,
      end_step: endStep,
      length: samplingDataLength,
    }).then((data) => setRawData(data.data.data));
  }, []);

  useEffect(() => {
    if (rawData === null) return;
    let data = rawData.values;
    let minVal = rawData.vmin, maxVal = rawData.vmax;

    // console.log(rawData);
    // console.log(data);

    const numNeuron = data[0].length;
    const dataLength = data.length;

    const focus = d3.select(svgRef.current).select("g.focus");
    const context = d3.select(svgRef.current).select("g.context");
    // 值映射
    const x1Scale = d3.scaleLinear()
      .range([0, width])
      .domain([0, dataLength - 1]);

    const x1CurrentScale = d3.scaleLinear()
      .range([0, width])
      .domain([0, dataLength - 1]); // 每次focus部分的数据范围变化，这里的domain跟着变化

    const x2Scale = d3.scaleLinear()
      .range([0, width])
      .domain([0, dataLength - 1]);

    const focusAreaYScale = d3.scaleLinear().domain([1, numNeuron]).range([height, 0]);

    const z = d3.scaleLinear().domain([minVal, maxVal]).range([0, 1]);

    const drawPixelMap = (drawArea, width, height, data, currMin?, currMax?) => {
      const color = d3.scaleSequential(d3.interpolateRgb("blue", "white"));

      if (!currMin || !currMax)
        color.domain([minVal, maxVal]);
      else
        color.domain([currMin, currMax]);

      const cellWidth = width / data.length;
      const cellHeight = height / data[0].length;
      for (let i = 0; i < data.length; i++) { // i列
        for (let j = 0; j < data[0].length; j++) { // j行
          let val = data[i][j];
          drawArea.append("rect")
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("x", i * cellWidth)
            .attr("y", j * cellHeight)
            .attr("fill", color(val));
        }
      }
    }

    const drawXAxis = (drawArea, height, AxisX) => {
      drawArea
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(AxisX);
    }

    focus.select("g.pixelMap").remove();
    const heatMap = focus.append("g").attr("class", "pixelMap")

    drawPixelMap(heatMap, width, height, data);
    x1CurrentScale.domain([0, dataLength - 1]); // 目前数据范围
    // 坐标轴
    const focusAxisX = d3.axisBottom(x1Scale);
    // 增加坐标和横线 
    // 绘制x坐标轴
    focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标
    drawXAxis(focus.select(".focus-axis"), height, focusAxisX);

    // --------------------context部分-----------------------------
    context.selectAll(".brush").remove();

    const contextHeatMap = context.append("g") // 增加热力图
    drawPixelMap(contextHeatMap, width, height2, data);
    const contextAxisX = d3.axisBottom(x2Scale);
    // 增加坐标和横线 
    // 绘制x坐标轴
    context.selectAll(".axis--x").remove(); // 清除原来的坐标
    drawXAxis(context, height2, contextAxisX);

    const swapArrayElement = (s: [], a: number, b: number): void => {
      let temp = s[a];
      s[a] = s[b];
      s[b] = temp;
    }

    const brushEnd = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      if (!(d3.event.sourceEvent instanceof MouseEvent)) return
      let s = d3.event.selection // s是刷选的实际范围
      if (s[1] < s[0]) swapArrayElement(s, 0, 1);
      // s[0] 
      const domain = s.map(x1Scale.invert).map(d => { return Math.round(d) });

      let [tempStartStep, tempEndStep] = domain.map(d => {
        // domain对应的原始的startStep 和 endStep
        let t = d / (samplingDataLength - 1);
        return Math.ceil(t * (endStep - startStep) + startStep);
      })

      console.log(tempStartStep, tempEndStep);

      getTensorHeatmapSequential({
        start_step: tempStartStep,
        end_step: tempEndStep,
        length: samplingDataLength * 2
      }).then((data) => {
        // console.log(data.data.data)

        let tempFocusPartData = data.data.data.values;
        let tempMinVal = data.data.data.vmin, tempMaxVal = data.data.data.vmax;
        // console.log("tempFocusPartData", tempFocusPartData);
        focus.select("g.pixelMap").remove();
        const heatMap = focus.append("g").attr("class", "pixelMap")

        drawPixelMap(heatMap, width, height, tempFocusPartData, tempMinVal, tempMaxVal);

        // 坐标轴
        focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标
        const tempX1Scale = d3.scaleLinear()
          .range([0, width])
          .domain([tempStartStep, tempEndStep]);
        const tempAxisX = d3.axisBottom(tempX1Scale);
        focus.select(".focus-axis")
          .append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(tempAxisX);
      })
    }

    const brushHandler = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      if (!(d3.event.sourceEvent instanceof MouseEvent)) return
      let s = d3.event.selection // s是刷选的实际范围
      if (s[1] < s[0]) swapArrayElement(s, 0, 1);
      // s[0] 
      const domain = s.map(x1Scale.invert).map(d => { return Math.round(d) });

      focus.select("g.pixelMap").remove(); // 删除原来的热力图

      const heatMap = focus.append("g").attr("class", "pixelMap")
      drawPixelMap(heatMap, width, height, data.slice(domain[0], domain[1] + 1));
      x1CurrentScale.domain([domain[0], domain[1]]); // 目前数据范围

      focus.select('.focus-axis').selectAll(".axis--x").remove(); // 删除原来的坐标系


      const tempX1Scale = d3.scaleLinear().range([0, width]).domain([domain[0], domain[1]]);
      const tempFocusAxisX = d3.axisBottom(tempX1Scale);
      drawXAxis(focus.select(".focus-axis"), height, tempFocusAxisX);
    };

    const brushStart = () => { // 重新画一张完整的热力图
      // focus.select("g.pixelMap").remove();
      // const heatMap = focus.append("g").attr("class", "pixelMap")

      // drawPixelMap(heatMap, width, height, data);
      // x1CurrentScale.domain([0, dataLength - 1]); // 目前数据范围
      // // 坐标轴
      // const focusAxisX = d3.axisBottom(x1Scale);
      // // 增加坐标和横线 
      // // 绘制x坐标轴
      // focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标
      // drawXAxis(focus.select(".focus-axis"), height, focusAxisX);
    }

    const brush = d3.brushX()
      .extent([
        [0, 0],
        [width, height2],
      ])
      // .on("start", brushStart)
      .on("brush start", brushHandler)
      .on('end', brushEnd);

    context
      .append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x2Scale.range());

    // const brushFocusPartStart = () => {
    // }
    // const brushFocusPartHandler = () => {
    // }
    const brushFocusPartEnd = () => {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      if (!(d3.event.sourceEvent instanceof MouseEvent)) return
      let s = d3.event.selection // s是刷选的实际范围
      if (s[1] < s[0]) swapArrayElement(s, 0, 1);
      const domain = s.map(x1CurrentScale.invert).map(d => { return Math.round(d) });

      // 刷选结束，目前刷选的区域的数据范围是：domain[0] - domain[1];
      const brushedData = data.slice(domain[0], domain[1] + 1);
      // console.log(brushedData);

    }
    const brushFocusPart = d3.brushX()
      .extent([
        [0, 0],
        [width, height],
      ])
      // .on("start", brushFocusPartStart)
      // .on("brush", brushFocusPartHandler)
      .on('end', brushFocusPartEnd);

    let keyDown = false;
    document.addEventListener("keydown", event => {
      if (!keyDown && event.code === "ControlLeft") {
        focus
          .append("g")
          .attr("class", "brush")
          .call(brushFocusPart)

        keyDown = true;
      }
    });

    document.addEventListener("keyup", event => {
      if (event.isComposing || event.code === "ControlLeft") {

        focus.select("g.brush").remove();
        keyDown = false;
      }
    });


  }, [rawData]);


  return (
    <div className="pixel-map-container" ref={measuredRef}>
      <svg style={{ height: svgHeight, width: svgWidth }} ref={svgRef}>
        <defs>
          <clipPath id={"pixelMap-clip"}>
            <rect width={width} height={height} />
          </clipPath>
        </defs>
        <g
          className="focus"
          transform={`translate(${margin.left},${margin.top})`}
        >
          <g className="focus-axis"></g>
        </g>
        <g
          className="context"
          transform={`translate(${margin2.left},${margin2.top})`}
        ></g>

      </svg>
    </div>
  );
};

export default PixelMap;
