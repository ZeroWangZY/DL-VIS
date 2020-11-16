import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Popover from '@material-ui/core/Popover';
import Slider from '@material-ui/core/Slider';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import * as d3 from "d3";
import "./RadarChartDrawer.css";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";
import * as _ from 'lodash';
import { message } from 'antd';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';

export interface RadarData {
  "axis": number;
  "value": number;
}

interface RawData {
  value: number[];
  label: number;
  index: number;
}

interface setShowCollectionFunc {
  (isShow: boolean): void;
}

interface setLayerTypeFunc {
  (layerType: string): void;
}

interface Props {
  rawData: any[];
  step?: number,
  setShowCollection?: setShowCollectionFunc,
  showCollection?: boolean,
  setLayerType?: setLayerTypeFunc,
  layerType?: string
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 200 + theme.spacing(3) * 2,
    float: "left",
    padding: 10
  },
  margin: {
    height: theme.spacing(3),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}));
const currentValue = { opacity: 0.2, dotRadius: 3, strokeWidth: 2 };

const RadarChartDrawer: React.FC<Props> = (props: Props) => {
  const { step, setShowCollection, showCollection, setLayerType, layerType } = props;
  const [DetailInfoOfCurrentStep, setDetailInfoOfCurrentStep] = useState([]);
  const classes = useStyles();

  const [isShowPopover, setIsShowPopover] = useState(false);
  const [left, setLeft] = useState(null);
  const [top, setTop] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const globalStates = useGlobalStates();
  const [mousePos, setMousePos] = useState(null);
  const [labelsData, setLabelsData] = useState([]);

  let rawData = props.rawData;

  const filterLayerType = globalStates.filterLayerType;
  const filterLabelType = globalStates.filterLabelType;

  useEffect(() => {
    let root = d3.select("g.axisWrapper").select("g.forceDirectedGraphContainer");
    root.selectAll('line.layerLevelLink').remove();
    root.selectAll('circle.dot').remove();
    root.selectAll('circle.label-node').remove();
    let radar = d3.selectAll('g.radarWrapper');
    radar.remove();
    if (showCollection && filterLayerType !== 'ALL') {
      rawData = rawData.filter((item) => item.layerType === filterLayerType);
    }
    if (filterLabelType.length !== 0) {
      rawData = rawData.filter((item) => filterLabelType.includes(item.label));
    }
    if (!rawData || rawData.length === 0) return;

    // 雷达图
    let radarChartMargin = { top: 50, right: 50, bottom: 50, left: 50 },
      radarChartWidth = Math.min(600, window.innerWidth - 10) - radarChartMargin.left - radarChartMargin.right,
      radarChartHeight = Math.min(radarChartWidth, window.innerHeight - radarChartMargin.top - radarChartMargin.bottom - 20);
    let ForceGraphSize = (Math.min(radarChartWidth, radarChartHeight) / 2) / 2 * Math.sqrt(2); // 内圈圆半径 * sqrt(2);

    drawRadarChart(rawData, radarChartMargin, radarChartWidth, radarChartHeight);
    // Radiz图 
    drawForceDirectedGraph(rawData, 200, radarChartWidth, radarChartHeight, radarChartMargin);
  }, [rawData, filterLayerType, filterLabelType]);

  const drawForceDirectedGraph = (rawData, size, radarChartWidth, radarChartHeight, radarChartMargin) => {
    // 数据转换

    if (rawData.length === 0) {
      return;
    }

    let dimensions = [];
    let data1 = [];
    for (let i = 0; i < rawData[0]["value"].length; i++) {
      dimensions.push("a" + (i + 1))
    }

    for (let i = 0; i < rawData.length; i++) {
      let temp = {};
      for (let j = 0; j < rawData[i]["value"].length; j++)
        temp["a" + (j + 1)] = rawData[i]["value"][j];
      temp["dataIndex"] = rawData[i]["index"];
      temp["colorIndex"] = rawData[i]["label"];
      temp['step'] = rawData[i]["step"];
      data1.push(temp);
    }

    const config = {
      el: document.querySelector('.radarChart'),
      size: size,
      margin: 0,
      color: d3.scaleOrdinal(d3.schemeCategory10).domain(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
      dimensions: dimensions,
      zoomFactor: 1,
      dotRadius: currentValue.dotRadius,
      tooltipFormatter: function (d) {
        return d;
      }
    };

    let radviz = radvizComponent(config, size, radarChartWidth, radarChartHeight, radarChartMargin);

    radviz.render(data1);
  }

  let radvizComponent = function (config, size, radarChartWidth, radarChartHeight, radarChartMargin) {

    const render = function (data) {

      if (data.length === 0) {
        return;
      }

      // data = addNormalizedValues(data);
      let normalizeSuffix = '_normalized';
      let dimensionNamesNormalized = config.dimensions.map(function (d) {
        return d + normalizeSuffix;
      });
      let thetaScale = d3.scaleLinear().domain([0, dimensionNamesNormalized.length]).range([0, Math.PI * 2]);

      let chartRadius = config.size / 2 - config.margin;
      let nodeCount = data.length;
      let panelSize = config.size - config.margin * 2;

      data.forEach(function (d) {
        d.x = panelSize / 2 - 100;
        d.y = panelSize / 2 - 100;
      });

      let dimensionNodes = config.dimensions.map(function (d, i) {
        let angle = thetaScale(i);
        let x = chartRadius + Math.cos(angle - Math.PI / 2) * chartRadius * config.zoomFactor - 100;
        let y = chartRadius + Math.sin(angle - Math.PI / 2) * chartRadius * config.zoomFactor - 100;
        return {
          index: nodeCount + i,
          x: x,
          y: y,
          fixed: true,
          name: d,
          fx: x,
          fy: y
        };
      });

      let linksData = [];
      data.forEach(function (d, i) {
        dimensionNamesNormalized.forEach(function (dB, iB) {
          linksData.push({
            source: i,
            target: nodeCount + iB,
            value: d[dB]
          });
        });
      });

      let root = d3.select("g.axisWrapper").select("g.forceDirectedGraphContainer");

      const simulation = d3.forceSimulation()
        .force("charge", null)
        .alphaDecay(0.1);

      simulation
        .nodes(data.concat(dimensionNodes))
        .force("link", d3.forceLink(linksData).strength((link) => {
          const { source, target } = link;
          const name = target.name;
          return source[name];
        }));

      simulation.tick(10);

      let panel = d3.select("g.axisWrapper").select("g.forceDirectedGraphContainer").select("circle.forceDirectedGraphContainerCircle")

      // Links
      let links = root.selectAll('.link')
        .data(linksData)
        .enter().append('line')
        .classed('layerLevelLink', true);

      // Nodes
      let nodes = root.selectAll('circle.dot')
        .data(data)
        .enter().append('circle')
        .attr("class", function (d) { return "dot id_" + (d as any).index })
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y)
        .attr("r", config.dotRadius)
        .attr("fill", function (d: any, i): any {
          return config.color(d.colorIndex + "");
        })
        .on('mouseenter', function (d: any) {

          d3.selectAll(".radarStroke")
            .style("stroke-opacity", 0.1);

          d3.select(".radarWrapper").selectAll("#line" + d.index)
            .style("stroke-width", 7 + "px")
            .style("stroke-opacity", 1); // 改变当前区域的透明度

          this.classList.add('active');

          let newDetailInfoOfCurrentStep = [];
          newDetailInfoOfCurrentStep.push({
            "step": step ? step : d.step,
            "label": d.colorIndex,
            "index": d.dataIndex,
          })
          setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);

          setMousePos([d3.mouse(this)[0] + radarChartWidth / 2, d3.mouse(this)[1] + radarChartWidth / 2]);
        })
        .on('mouseout', function (d: any) {
          d3.select(".radarWrapper").selectAll("#line" + d.index)
            .style("stroke-width", currentValue.strokeWidth + "px")

          d3.selectAll(".radarStroke")
            .style("stroke-opacity", currentValue.opacity);

          this.classList.remove('active');

          setMousePos(null);
          setDetailInfoOfCurrentStep([]);
        });

      // Labels n1 - n12
      let labelNodes = root.selectAll('circle.label-node')
        .data(dimensionNodes)
        .enter().append('circle')
        .classed('label-node', true)
        .attr("cx", function (d) {
          return (d as any).x;
        })
        .attr("cy", function (d) {
          return (d as any).y;
        })
        .attr("r", 2);

      // Update force
      simulation.on('tick', function () {

        links.attr("x1", function (d) { return d.source.x; })
          .attr("y1", function (d) { return d.source.y; })
          .attr("x2", function (d) { return d.target.x; })
          .attr("y2", function (d) { return d.target.y; })

        nodes.attr("cx", function (d: any) { return d.x; })
          .attr("cy", function (d: any) { return d.y; })

        labelNodes.attr("cx", function (d: any) { return d.x; })
          .attr("cy", function (d: any) { return d.y; })
      });

      return this;
    };

    const addNormalizedValues = function (data) {
      data.forEach(function (d) {
        config.dimensions.forEach(function (dimension) {
          d[dimension] = +d[dimension];
        });
      });

      let normalizationScales = {};
      config.dimensions.forEach(function (dimension) {
        let dimension1 = dimension;
        normalizationScales[dimension] = d3.scaleLinear()
          .domain(
            d3.extent(data.map(function (d, i) {
              return d[dimension1];
            })) as [number, number]).range([0, 1]);
      });

      data.forEach(function (d) {
        config.dimensions.forEach(function (dimension) {
          d[dimension + '_normalized'] = normalizationScales[dimension](d[dimension]);
        });
      });

      return data;
    };

    let exports = { render: render };

    return exports;
  };

  const drawRadarChart = (rawData, margin, width, height) => {

    if (rawData.length === 0) {
      return;
    }

    // 雷达图参数
    let radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 0.5,
      minValue: -0.5, // 最小值
      levels: 5,
      roundStrokes: true, // 折线图是否需要平滑处理
      opacityArea: 0, //The opacity of the area of the blob
      opacityCircles: 0, //The opacity of the circles of each blob
      strokeWidth: currentValue.strokeWidth, //The width of the stroke around each blob
    };

    // 数据处理，转换为适合画图的数据格式
    let data = [];

    // axis范围是 rawData1[0].value.length
    // rawData1 的长度表示有多少个样本
    for (let i = 0; i < rawData.length; i++) {
      let value = rawData[i]["value"];
      let colorIndex = rawData[i]["label"];
      let dataIndex = rawData[i]["index"];
      let obj = [];
      for (let j = 0; j < value.length; j++) {
        let temp = {};
        temp["axis"] = j + 1;
        temp["value"] = value[j];
        temp["colorIndex"] = colorIndex;
        temp["dataIndex"] = dataIndex;
        obj.push(temp);
      }
      obj['data_index'] = i;
      obj['step'] = rawData[i]["step"];
      data.push(obj);
    }
    radarChart(".radarChart", data, radarChartOptions, width); // 画雷达图
  }

  const radarChart = (id, data, options, radarChartWidth) => {
    let cfg = {
      w: 400, //Width of the circle
      h: 400, //Height of the circle
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }, //The margins of the SVG
      levels: 3, //How many levels or inner circles should there be drawn
      maxValue: 0, //What is the value that the biggest circle will represent
      minValue: 0, // 最小值
      labelFactor: 1.25, //How much farther than the radius of the outer circle should the labels be placed
      wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
      opacityArea: 0.35, //The opacity of the area of the blob
      dotRadius: 4, //The size of the colored circles of each blog
      opacityCircles: 0.1, //The opacity of the circles of each blob
      strokeWidth: currentValue.strokeWidth, //The width of the stroke around each blob
      roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
      color: d3.scaleOrdinal(d3.schemeCategory10)
        .domain(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) //Color function
    };

    // 将所有options中的内容全部放到cfg(configuration中);
    if ('undefined' !== typeof options) {
      for (let i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    }

    // 如果数据中的最大值比maxValue还要大，更新maxValue;
    let radarChartMaxValue = -Infinity,
      radarChartMinValue = Infinity;
    // for (let elem of data) {
    //   for (let d of elem) {
    //     radarChartMaxValue = Math.max(d.value, radarChartMaxValue);
    //     radarChartMinValue = Math.min(d.value, radarChartMinValue);
    //   }
    // }
    radarChartMaxValue = 1, radarChartMinValue = 0;

    let allAxis = (data[0].map(function (i, j) {
      return i.axis
    })), //每个axis的名字
      total = allAxis.length, //The number of different axes
      outRadius = Math.min(cfg.w / 2, cfg.h / 2), //最外层圆的半径
      Format = d3.format('.2f'), // 每一个圆圈代表的数字的格式， 可以换成其他，比如 ".2f"
      angleSlice = Math.PI * 2 / total; //两个axis之间的角度是多大

    let innerRadius = outRadius / 2; // 最内层圆的半径，可以调节，目前取1/2

    //Scale for the radius
    let rScale = d3.scaleLinear()
      .range([innerRadius, outRadius])
      .domain([radarChartMinValue, radarChartMaxValue]);

    // Create the container SVG and g
    //Remove whatever chart with the same id/class was present before
    d3.select(id).select("svg").remove();

    //Initiate the radar chart SVG
    let svg = d3.select(id).append("svg")
      .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
      .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
      .attr("class", "radar" + id);
    //Append a g element		
    let g = svg.append("g")
      .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

    // Glow filter for some extra pizzazz
    //Filter for the outside glow
    let filter = g.append('defs').append('filter').attr('id', 'glow'),
      feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
      feMerge = filter.append('feMerge'),
      feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
      feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw the Circular grid 
    //Wrapper for the grid & axes
    let axisGrid = g.append("g").attr("class", "axisWrapper");

    //Draw the background circles
    axisGrid.selectAll(".levels")
      .data(d3.range(0, (cfg.levels + 1)).reverse()) // // [5,4,3,2,1]
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", function (d, i) {
        return (outRadius - innerRadius) / cfg.levels * d + innerRadius; // 目前levels为 5
      })
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", cfg.opacityCircles) // 每个圆的透明度，这样的话，中间的圆就会因为透明度叠加而变深
      .style("filter", "url(#glow)");

    axisGrid.append("g")
      .attr("class", "forceDirectedGraphContainer")
      .append("circle")
      .attr("class", "forceDirectedGraphContainerCircle")
      .attr("r", (outRadius - innerRadius) / cfg.levels * (-1) + innerRadius)
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", cfg.opacityCircles);

    //Text indicating at what % each level is
    axisGrid.selectAll(".axisLabel")
      .data(d3.range(0, (cfg.levels + 1)).reverse()) // // [5,4,3,2,1]
      .enter().append("text")
      .attr("class", "axisLabel")
      .attr("x", 4)
      .attr("y", function (d) {
        return -d * (outRadius - innerRadius) / cfg.levels - innerRadius;
      })
      .attr("dy", "0.4em")
      .style("font-size", "10px")
      .attr("fill", "#737373")
      .text(function (d, i) {
        return Format((radarChartMaxValue - radarChartMinValue) * d / cfg.levels + radarChartMinValue);
      });

    // Draw the axes
    //Create the straight lines radiating outward from the center
    let axis = axisGrid.selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");

    //Append the labels at each axis
    axis.append("text")
      .attr("class", "legend")
      .style("font-size", "11px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", function (d, i) {
        return rScale(Math.abs(radarChartMaxValue) * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("y", function (d, i) {
        return rScale(Math.abs(radarChartMaxValue) * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .text(function (d) {
        return d + "";
      })
      .call(wrap, cfg.wrapWidth); // 调用末尾的wrap函数

    // The radial line function
    let radarLine = d3.radialLine()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d["value"]))
      .angle((d, i) => i * angleSlice);

    if (cfg.roundStrokes) {
      radarLine.curve(d3.curveCardinalClosed)
    }

    //Create a wrapper for the blobs	
    let blobWrapper = g.append("g")
      .attr("class", "radarWrapper");

    const parsePointsFromPath = (path: string) => {
      let res = new Array(2);
      let pointsNumber = [];
      let pointsString = [];

      let pos = "";
      let point = [];
      for (let i = 1; i < path.length; i++) {
        if (path[i] === ',' || path[i] === 'C' || path[i] === ' ') {
          if (point.length === 0) { // x位置
            point.push(pos);
            pos = ""; // 清空
            continue;
          } else if (point.length === 1) { // y位置
            point.push(pos);
            pointsString.push(point);
            pointsNumber.push([parseFloat(point[0]), parseFloat(point[1])]);
            pos = ""; // 清空
          }
          point = []; // 清空
        } else {
          pos += path[i];
        }
      }

      if (point.length === 1) {
        point.push(pos);
        pointsString.push(point);
        pointsNumber.push([parseFloat(point[0]), parseFloat(point[1])]);
      }

      // 此时，pointsNumber 0 3 6 。。。为起点，中间的两个为控制点
      // 调整点的位置，使得 pointsNumber[0][0] 为0 

      let delta = 1; //因为差别很大，所以delta设为1

      if (Math.abs(pointsNumber[0][0] - 1) > delta) { // 打破原来的闭环
        pointsNumber.pop();
        pointsString.pop();
      }

      while (Math.abs(pointsNumber[0][0] - 1) > delta) {
        let n = 3;
        while (n--) {
          pointsNumber.unshift(pointsNumber.pop());
          pointsString.unshift(pointsString.pop());
        }
      }
      pointsNumber.push(pointsNumber[0]); // 形成闭环
      pointsString.push(pointsString[0]);

      res[0] = pointsNumber;
      res[1] = pointsString;
      return res;
    }

    function disintegrate(pointsNumber, pointsString) {
      let res = [];
      let segment = "";
      for (let i = 0; i < pointsString.length - 3; i += 3) {
        segment = "M" + pointsString[i][0] + "," + pointsString[i][1] + "C";
        segment += (pointsString[i + 1][0] + "," + pointsString[i + 1][1] + ","); // 第一个控制点
        segment += (pointsString[i + 2][0] + "," + pointsString[i + 2][1] + ","); // 第二个控制点
        segment += (pointsString[i + 3][0] + "," + pointsString[i + 3][1]); // 第一个控制点

        res.push(segment);
        segment = "";
      }
      return res;
    }

    function direction(pointsNumber, pointsString, segmentIdx): string[] { // segmentIdx为第几段，[3*segmentIdx, 3*segmentIdx+3]
      let startPoint: [number, number] = pointsNumber[3 * segmentIdx];
      let endPoint: [number, number] = pointsNumber[3 * segmentIdx + 3];

      let delta = 1; // 因为此处距离会足够大，所以delta也取得较大
      let x1, x2, y1, y2;
      if (Math.abs(startPoint[0] - endPoint[0]) < delta) { // 相等 -->  竖直方向
        x1 = "0%";
        x2 = "0%";
      } else if (startPoint[0] > endPoint[0]) { // x 方向从右向左
        x1 = "100%";
        x2 = "0%";
      } else if (startPoint[0] < endPoint[0]) { // x方向从左往右
        x1 = "0%";
        x2 = "100%";
      }

      if (Math.abs(startPoint[1] - endPoint[1]) < delta) { // 相等 -->  水平方向
        y1 = "0%";
        y2 = "0%";
      } else if (startPoint[1] > endPoint[1]) { // x 方向从下往上
        y1 = "100%";
        y2 = "0%";
      } else if (startPoint[1] < endPoint[1]) { // x方向从上往下
        y1 = "0%";
        y2 = "100%";
      }
      return [x1, y1, x2, y2];
    }

    for (let j = 0; j < data.length; j++) {
      let testD = data[j];

      let minValue = Infinity,
        maxValue = -Infinity;
      for (let d of testD) {
        minValue = Math.min(minValue, d["value"]);
        maxValue = Math.max(maxValue, d["value"]);
      }

      let opacityScale = d3.scaleLinear().domain([minValue, maxValue]).range([0.2, 1]); // 对于一个数据实例来说
      let stokeColor = cfg.color(testD[0].colorIndex);
      let testPathD = radarLine(testD);

      const [pointsNumber, pointsString] = parsePointsFromPath(testPathD); // 返回二维数组，第一维是一个浮点数数组，表示每个点的位置，第二维是第一维的字符串形式

      let segments = disintegrate(pointsNumber, pointsString); // 形成segments.length条路径 每条路径是一个三次贝塞尔曲线 M C  

      for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];
        let defsId = "myTest" + Math.random().toString(36).slice(-8);

        // 对于第i段，它的起始透明度
        let startOpacity = opacityScale(testD[i]["value"]);
        let endOpacity = (i === segments.length - 1) ? opacityScale(testD[0]["value"]) : opacityScale(testD[i + 1]["value"]);
        const [x1, y1, x2, y2] = direction(pointsNumber, pointsString, i);

        if (j === 18) {
          console.log(pointsNumber);
          console.log([x1, y1, x2, y2]);
        }


        let linearGradientOpacity = g.append('defs')
          .append('linearGradient')
          .attr('id', defsId)
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x2)
          .attr("y2", y2)

        linearGradientOpacity.append("stop").attr("offset", "0%").attr("stop-color", stokeColor).attr("stop-opacity", startOpacity)
        linearGradientOpacity.append("stop").attr("offset", "50%").attr("stop-color", stokeColor).attr("stop-opacity", (endOpacity + startOpacity) / 2)
        linearGradientOpacity.append("stop").attr("offset", "100%").attr("stop-color", stokeColor).attr("stop-opacity", endOpacity)

        blobWrapper
          .append("path")
          .attr("id", "line" + j)
          .attr("class", "radarStroke")
          .attr("d", segment)
          .style("shape-rendering", "auto")
          .style("stroke-width", cfg.strokeWidth + "px")
          .style("fill", "none")
          .style("stroke", "url(#" + defsId + ")")
          .style("stroke-opacity", currentValue.opacity)
          .on('mouseover', function (d) {
            d3.selectAll(".radarStroke")
              .style("stroke-opacity", 0.1);

            d3.selectAll("#line" + j)
              .style("stroke-width", cfg.strokeWidth + 5 + "px")
              .style("stroke-opacity", 1); // 改变当前区域的透明度

            d3.select(".dot.id_" + j)
              .classed("active", true);
          })
          .on('mouseout', function (d) {
            d3.selectAll("#line" + j)
              .style("stroke-width", currentValue.strokeWidth + "px")

            d3.selectAll(".radarStroke")
              .style("stroke-opacity", currentValue.opacity);

            d3.select(".dot.id_" + j)
              .classed("active", false);

            setDetailInfoOfCurrentStep([]);
            setMousePos(null);
          })
          .on('mousemove', function (d) {
            let newDetailInfoOfCurrentStep = [];
            newDetailInfoOfCurrentStep.push({
              "step": step ? step : step,
              "label": testD[0].colorIndex,
              "index": testD[0].dataIndex,
            })
            setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);

            setMousePos([d3.mouse(this)[0] + radarChartWidth / 2, d3.mouse(this)[1] + radarChartWidth / 2]);
          })
          .on('contextmenu', () => {
            setIsShowPopover(true);
            const e = d3.event;
            e.preventDefault();
            setCurrentData(rawData[testD["data_index"]]);
            setLeft(e.pageX);
            setTop(e.pageY);
          });
      }
    }

    // Helper Function
    //Wraps SVG text	
    function wrap(text, width) {
      text.each(function () {
        let text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.4, // ems
          y = text.attr("y"),
          x = text.attr("x"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    } //wrap	

  } //RadarChart

  const getDetailInfoRect = (mousePosition) => {
    let [xPos, yPos] = mousePosition;
    let fontSize = 14;
    let containerWidth = 160;
    return (
      <div
        className="DetailInfoContainer"
        style={{
          left: xPos + (showCollection ? 20 : 0),
          top: yPos + (showCollection ? -60 : 0),
          width: containerWidth,
        }}>
        <div style={{ marginLeft: '8px', marginTop: '2px' }}>
          {"step: " + DetailInfoOfCurrentStep[0].step}
        </div>
        <div style={{ marginLeft: '8px', marginTop: '2px' }}>
          {"index: " + DetailInfoOfCurrentStep[0].index}
        </div>
        <div style={{ marginLeft: '8px', marginTop: '2px' }}>
          {"label: " + DetailInfoOfCurrentStep[0].label}
        </div>
      </div>
    )
  };

  const handleClosePopover = () => {
    setIsShowPopover(false);
  };

  const handleAddClick = () => {
    const collectionDataSet = globalStates.collectionDataSet.slice();

    let isNeededPush = true;
    for (let d of collectionDataSet) {
      if (_.isEqual(d, currentData)) {
        isNeededPush = false;
      }
    }

    const labels = globalStates.currentLabelType.slice();

    if (isNeededPush) {
      currentData.step = step;
      currentData.layerType = globalStates.currentLayerType;
      collectionDataSet.push(currentData);
      const label = currentData.label;
      if (!labels.includes(label)) {
        labels.push(label);
      }
      message.info('已成功添加至Collection.');
    }
    else {
      message.info('在Collection中已存在.');
    }

    // console.log('collectionDataSet: ', collectionDataSet);
    // console.log('labels: ', labels);

    modifyGlobalStates(GlobalStatesModificationType.SET_CURRENT_LABEL_TYPE, labels);
    modifyGlobalStates(GlobalStatesModificationType.ADD_COLLECTION, collectionDataSet);

    setIsShowPopover(false);
  };

  const handleDelClick = () => {
    const collectionDataSet = globalStates.collectionDataSet.slice();
    const labels = globalStates.currentLabelType.slice();

    let index = -1;
    let isNeededDel = false;
    let label = currentData.label;
    for (let d of collectionDataSet) {
      index++;
      if (_.isEqual(d, currentData)) {
        isNeededDel = true;
        break;
      }
    }

    let count = 0;
    for (let d of collectionDataSet) {
      if ((d as any).label === label) {
        count++;
      }
    }

    if (isNeededDel) {
      collectionDataSet.splice(index, 1);
      if (count === 1) {
        const labelIndex = labels.indexOf(label);
        labels.splice(labelIndex, 1);
      }
      message.info('已成功从Collection中删除.');
    }
    else {
      message.info('在Collection中不存在，无法删除.');
    }

    if (collectionDataSet.length === 0) {
      setShowCollection(false);
    }

    // console.log('删除：collectionDataSet', collectionDataSet);
    // console.log('删除：labels', labels);

    modifyGlobalStates(GlobalStatesModificationType.SET_CURRENT_LABEL_TYPE, labels);
    modifyGlobalStates(GlobalStatesModificationType.DEL_COLLECTION, collectionDataSet);
    setLabelsData([]);
    setIsShowPopover(false);
  };

  function ondotRadiusChange(e, value) {
    d3.select("g.axisWrapper").select("g.forceDirectedGraphContainer").selectAll('circle.dot').attr("r", value);
    currentValue.dotRadius = value;
  }

  function onLineOpacityChange(e, value) {
    d3.selectAll(".radarStroke").style("stroke-opacity", value);
    currentValue.opacity = value;
  }

  function onStrokeWidthChange(e, value) {
    d3.selectAll(".radarStroke").style("stroke-width", value);
    currentValue.strokeWidth = value;
  }

  const handleSelectLayerTypeChange = (e) => {
    const currentLayerType = e.target.value;
    // console.log('filter layer type: ', currentLayerType);
    setLayerType(currentLayerType);
    modifyGlobalStates(
      GlobalStatesModificationType.SET_FILTER_LAYER_TYPE,
      currentLayerType
    );
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleLabelChange = (e) => {
    const filterLabelType = e.target.value;

    // console.log('filter label type: ', filterLabelType);

    modifyGlobalStates(
      GlobalStatesModificationType.SET_FILTER_LABEL_TYPE,
      filterLabelType
    );
    setLabelsData(filterLabelType);
  };

  return (
    <>
      <div className="radarChart" style={{ "float": "left" }}></div>

      {mousePos !== null && DetailInfoOfCurrentStep.length &&
        getDetailInfoRect(mousePos)
      }

      <div className={classes.root}>
        <Typography id="dotRadius-slider" gutterBottom>
          dotRadius
      </Typography>
        <Slider
          getAriaValueText={(value) => { return (value + "") }}
          defaultValue={currentValue.dotRadius}
          min={0}
          step={0.1}
          max={10}
          aria-labelledby="dotRadius"
          onChange={ondotRadiusChange}
          valueLabelDisplay="auto"
        />
        <div className={classes.margin} />

        <Typography id="line-opacity-slider" gutterBottom>
          line-opacity
      </Typography>
        <Slider
          getAriaValueText={(value) => { return (value + "") }}
          defaultValue={currentValue.opacity}
          min={0}
          step={0.01}
          max={1}
          aria-labelledby="line-opacity"
          onChange={onLineOpacityChange}
          valueLabelDisplay="auto"
        />
        <div className={classes.margin} />

        <Typography id="stroke-width-slider" gutterBottom>
          stroke-width
      </Typography>
        <Slider
          getAriaValueText={(value) => { return (value + "") }}
          defaultValue={currentValue.strokeWidth}
          min={0}
          step={0.1}
          max={5}
          aria-labelledby="stroke-width"
          onChange={onStrokeWidthChange}
          valueLabelDisplay="auto"
        />

        {
          showCollection && (
            <>
              <Typography id="layer-type-opacity-slider" gutterBottom>
                Layer Type
              </Typography>
              <Select
                value={layerType}
                onChange={handleSelectLayerTypeChange}
              >
                <MenuItem value={'ALL'}>ALL</MenuItem>
                <MenuItem value={'FC'}>FC</MenuItem>
                <MenuItem value={'CONV'}>CONV</MenuItem>
                <MenuItem value={'RNN'}>RNN</MenuItem>
                <MenuItem value={'OTHER'}>OTHER</MenuItem>
              </Select>
              <Typography id="label-type-opacity-slider" gutterBottom>
                Label Type
              </Typography>
              <Select
                labelId="label-type-opacity-slider"
                id="label-type-mutiple-chip"
                multiple
                value={labelsData}
                onChange={handleLabelChange}
                input={<Input id="select-multiple-chip" />}
                renderValue={(selected: any) => (
                  <div className={classes.chips}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} className={classes.chip} />
                    ))}
                  </div>
                )}
                MenuProps={MenuProps}
              >
                {(globalStates.currentLabelType).map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </>
          )
        }
      </div>

      <Popover open={isShowPopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorReference='anchorPosition'
        anchorPosition={{ left, top }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handleClosePopover}>
        <CardContent style={{ width: 190 }}>
          <Typography
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: 'center'
            }}
          >COLLECTION OPTIONS
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{
              width: '100%',
              fontSize: 14,
              marginBottom: 5
            }}
            onClick={handleAddClick}
          >
            ADD COLLECTION
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            style={{
              width: '100%',
              fontSize: 14,
              marginBottom: 5
            }}
            onClick={handleDelClick}
          >
            DEL COLLECTION
          </Button>
        </CardContent>
      </Popover>
    </>
  );
};

export default RadarChartDrawer;
