import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import * as d3 from "d3";
import "./RadarChartDrawer.css"

export interface RadarData {
  "axis": number;
  "value": number;
}

interface Props {
  rawData: any;
}

const RadarChartDrawer: React.FC<Props> = (props: Props) => {
  const { rawData } = props;

  useEffect(() => {
    // 雷达图
    let radarChartMargin = { top: 50, right: 50, bottom: 50, left: 50 },
      radarChartWidth = Math.min(600, window.innerWidth - 10) - radarChartMargin.left - radarChartMargin.right,
      radarChartHeight = Math.min(radarChartWidth, window.innerHeight - radarChartMargin.top - radarChartMargin.bottom - 20);
    let ForceGraphSize = 240;
    drawRadarChart(rawData, radarChartMargin, radarChartWidth, radarChartHeight);
    // Radiz图 
    drawForceDirectedGraph(rawData, ForceGraphSize, radarChartWidth, radarChartHeight, radarChartMargin);
  }, [rawData]);

  const drawRadarChart = (rawData, margin, width, height) => {
    // 雷达图参数
    let radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 0.5,
      minValue: -0.5, // 最小值
      levels: 5,
      roundStrokes: true, // 折线图是否需要平滑处理
      color: d3.scaleOrdinal(d3.schemeCategory10),
      opacityArea: 0, //The opacity of the area of the blob
      opacityCircles: 0, //The opacity of the circles of each blob
      strokeWidth: 2, //The width of the stroke around each blob
    };

    // 数据处理，转换为适合画图的数据格式
    let numberOfLine = Object.keys(rawData[0]).length - 1; // 数据中必须包含index
    let data = []; // n1-n8数组
    for (let i = 0; i < numberOfLine; i++) data[i] = [];

    for (let d of rawData) {
      let keys = Object.keys(d); // index n1 n2 .... n12
      for (let i = 1; i < keys.length; i++) { // 忽略第一维"index"
        let key = keys[i];

        data[i - 1].push({
          axis: d["index"],
          value: d[key]
        });
      }
    }
    
    radarChart(".radarChart", data, radarChartOptions); // 画雷达图
  }

  const drawForceDirectedGraph = (rawData, size, radarChartWidth, radarChartHeight, radarChartMargin) => {
    // 数据转换
    let numberOfLine = Object.keys(rawData[0]).length - 1; // 数据中必须包含index
    let data1 = new Array(numberOfLine);
    let dimensions = [];
    for (let i = 0; i < data1.length; i++) { // 12 
      let obj = {}
      for (let j = 0; j < rawData.length; j++) { // 32
        obj["a" + (j + 1)] = -1; // a1 a2 .... a32
        if (i == 0) dimensions.push("a" + (j + 1));
      }
      data1[i] = obj
    } // 初始化对象数组
    
    for (let j = 0; j < rawData.length; j++) { // 0 - 31
      let d = rawData[j];
      let keys = Object.keys(d); // index n1 n2 .... n12
      for (let i = 1; i < keys.length; i++) { // 忽略第一维"index"
        let key = keys[i]; // n1 n2 .... n12
        data1[i - 1]["a" + (j + 1)] = d[key];
      }
    }

    let radviz = radvizComponent(size, radarChartWidth, radarChartHeight, radarChartMargin)
      .config({
        dimensions: dimensions,
      })
    
    // console.log('data1: ', data1);

    radviz.render(data1);
  }

  let radvizComponent = function (size, radarChartWidth, radarChartHeight, radarChartMargin) {
    let config = {
      el: document.querySelector('.radarChart'),
      size: size,
      margin: 30,
      colorScale: d3.scaleOrdinal().range(['skyblue', 'orange', 'lime']),
      colorAccessor: function (d) {
        return d['Region'];
      },
      dimensions: [],
      drawLinks: true,
      zoomFactor: 1,
      dotRadius: 6,
      useTooltip: false,
      tooltipFormatter: function (d) {
        return d;
      }
    };

    let events = d3.dispatch('dotEnter', 'dotLeave');

    let simulation = d3.forceSimulation()
      // .chargeDistance(0)
      .force("charge", d3.forceManyBody().strength(-60))
      .velocityDecay(0.5);

    let render = function (data) {
      data = addNormalizedValues(data);
      let normalizeSuffix = '_normalized';
      let dimensionNamesNormalized = config.dimensions.map(function (d) {
        return d + normalizeSuffix;
      });
      let thetaScale = d3.scaleLinear().domain([0, dimensionNamesNormalized.length]).range([0, Math.PI * 2]);

      let chartRadius = config.size / 2 - config.margin;
      let nodeCount = data.length;
      let panelSize = config.size - config.margin * 2;
      
      let dimensionNodes = config.dimensions.map(function (d, i) {
        let angle = thetaScale(i);
        let x = chartRadius + Math.cos(angle - Math.PI / 2) * chartRadius * config.zoomFactor;
        let y = chartRadius + Math.sin(angle - Math.PI / 2) * chartRadius * config.zoomFactor;
        return {
          index: nodeCount + i,
          x: x,
          y: y,
          fixed: true,
          name: d
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

      // console.log('node concat: ', data.concat(dimensionNodes));
      // console.log('panel: ', panelSize);

      simulation
        // .force("x", d3.forceX(panelSize / 2).strength(0.01))
        // .force("y", d3.forceY(panelSize / 2).strength(0.01))
        // .linkStrength(function (d) {
        //   return d.value;
        // })
        .force("center", d3.forceCenter(panelSize / 2 ,  panelSize / 2))
        .nodes(data.concat(dimensionNodes))
        .force("link", d3.forceLink(linksData))
      // .start();

      // Basic structure
      let svg = d3.select(config.el)
        .append('svg')
        .attr("width", config.size)
        .attr("height", config.size)
        .attr("transform", "translate(" + (-1 * (radarChartWidth + radarChartMargin.left + radarChartMargin.right) / 2 - size / 2) + "," + (-1 * (radarChartHeight + radarChartMargin.top + radarChartMargin.bottom) / 2 + size / 2) + ")")

      // console.log('config: ', config);

      let root = svg.append('g')
        .attr("transform", 'translate(' + [config.margin, config.margin] + ')');

      let panel = root.append('circle')
        .classed('panel', true)
        .attr("r", chartRadius)
        .attr("cx", chartRadius)
        .attr("cy", chartRadius)

      // Links
      let links;
      if (config.drawLinks) {
        links = root.selectAll('.link')
          .data(linksData)
          .enter().append('line')
          .classed('layerLevelLink', true);
      }

      // console.log('nodes: ', data);
      // console.log('links: ', linksData);

      // Nodes
      let nodes = root.selectAll('circle.dot')
        .data(data)
        .enter().append('circle')
        .attr("class", function (d) { return "dot id_" + (d as any).index })
        .attr("r", config.dotRadius)
        .attr("fill", function (d): any {
          return config.colorScale(config.colorAccessor(d));
        })
        .on('mouseenter', function (d) {
          d3.selectAll(".radarStroke")
            .style("stroke-opacity", 0.1);

          d3.select(".radarStroke.id_" + (d as any).index)
            .style("stroke-width", 7 + "px")
            .style("stroke-opacity", 1); // 改变当前区域的透明度

          this.classList.add('active');
        })
        .on('mouseout', function (d) {
          d3.select(".radarStroke.id_" + (d as any).index)
            .style("stroke-width", 2 + "px")

          d3.selectAll(".radarStroke")
            .style("stroke-opacity", 1);

          this.classList.remove('active');
        });

      // Labels n1 - n12
      let labelNodes = root.selectAll('circle.label-node')
        .data(dimensionNodes)
        .enter().append('circle')
        .classed('label-node', true)
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        })
        .attr("r", 2);

      // Update force
      simulation.on('tick', function () {
        if (config.drawLinks) {
          links.attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; })
        }

        nodes.attr("cx", function (d: any) { return d.x; })
          .attr("cy", function (d: any) { return d.y; })
      });
      return this;
    };

    let utils = {
      merge: function (obj1: any, obj2: any) {
        for (let p in obj2) {
          if (obj2[p] && obj2[p].constructor == Object) {
            if (obj1[p]) {
              this.merge(obj1[p], obj2[p]);
              continue;
            }
          }
          obj1[p] = obj2[p];
        }
      },

      mergeAll: function (obj1: any, obj2: any): any {
        let newObj = {};
        let objs = arguments;
        this.merge(newObj, obj1);
        this.merge(newObj, obj2);
        return newObj;
      }
    };

    let setConfig = function (_config) {
      config = utils.mergeAll(config, _config);
      return this;
    };

    let addNormalizedValues = function (data) {
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

    let exports = {
      config: setConfig,
      render: render
    };

    exports["on"] = d3_rebind(exports, events, events["on"]);

    return exports;

    function d3_rebind(target, source, method) {
      return function () {
        let value = method.apply(source, arguments);
        return value === source ? target : value;
      };
    }
  };

  const radarChart = (id, data, options) => {
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
      strokeWidth: 2, //The width of the stroke around each blob
      roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
      color: d3.scaleOrdinal(d3.schemeCategory10) //Color function
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
    let maxValue = -Infinity,
      minValue = Infinity;
    for (let elem of data) {
      for (let d of elem) {
        maxValue = Math.max(d.value, maxValue);
        minValue = Math.min(d.value, minValue);
      }
    }

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
      .domain([minValue, maxValue]);

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
        return Format((maxValue - minValue) * d / cfg.levels + minValue);
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
        return rScale(Math.abs(maxValue) * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("y", function (d, i) {
        return rScale(Math.abs(maxValue) * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
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
    let blobWrapper = g.selectAll(".radarWrapper")
      .data(data)
      .enter().append("g")
      .attr("class", "radarWrapper");

    //Create the outlines	
    blobWrapper.append("path")
      .attr("d", (d) => radarLine(d as [number, number][]))
      .attr("class", function (d, i) { return "radarStroke id_" + i })
      .style("stroke-width", cfg.strokeWidth + "px")
      .style("stroke", function (d, i) {
        return cfg.color(i + "");
      })
      .style("fill", "none")
      .style("filter", "url(#glow)")
      .on('mouseover', function (d, i) {
        d3.selectAll(".radarStroke")
          .style("stroke-opacity", 0.1);

        d3.select(this)
          .style("stroke-width", cfg.strokeWidth + 5 + "px")
          .style("stroke-opacity", 1); // 改变当前区域的透明度

        d3.select(".dot.id_" + i)
          .classed("active", true);
      })
      .on('mouseout', function (d, i) {
        d3.select(this)
          .style("stroke-width", cfg.strokeWidth + "px")

        d3.selectAll(".radarStroke")
          .style("stroke-opacity", 1);

        d3.select(".dot.id_" + i)
          .classed("active", false);

        tooltip.transition().duration(200)
          .style("opacity", 0);
      })
      .on('mousemove', function (d, i) {
        // 增加tooltips
        let newX = d3.mouse(this)[0] + 10;
        let newY = d3.mouse(this)[1] - 10;

        tooltip
          .attr('x', newX)
          .attr('y', newY)
          .text(i)
          .transition().duration(200)
          .style('opacity', 1);
      });

    //Set up the small tooltip for when you hover over a circle
    let tooltip = g.append("text")
      .attr("class", "tooltip")
      .style("opacity", 0);

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


  return (
    <div>
      <div className="radarChart"></div>
      {/* <div className="forceDirectedGraph"></div> */}
    </div>
  );
};

export default RadarChartDrawer;
