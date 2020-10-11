import React, { useEffect, useState } from "react";
import { ShowActivationOrGradient } from "../../store/global-states.type";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import * as d3 from "d3";
import Popover from "@material-ui/core/Popover";
import CircularProgress from "@material-ui/core/CircularProgress";
import { fetchTensorHeatmapBase64 } from "../../api/layerlevel";
import { TensorMetadata } from "./TensorHeatmap";

export interface RadarChartProps {
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

const TensorHeatmap: React.FC<RadarChartProps> = (
  props: RadarChartProps
) => {
  const classes = useStyles();
  const { tensorMetadata, isShowing, setIsShowing, anchorPosition } = props;
  const { type, step, dataIndex, nodeId } = tensorMetadata;
  const isValid = type !== null && step != null && dataIndex !== null;
  const show = isValid && isShowing;
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const handleClose = () => {
    setIsShowing(false);
  };

  useEffect(() => {
    if (!isValid) return;
    setShowLoading(true);
    let typeParam;
    if (type === ShowActivationOrGradient.ACTIVATION) {
      typeParam = "activation";
    }
    if (type === ShowActivationOrGradient.GRADIENT) {
      typeParam = "gradient";
    }
    // fetchTensorHeatmapBase64({
    //   graph_name: "alexnet",
    //   node_id: nodeId,
    //   type: typeParam,
    //   step: step,
    //   data_index: dataIndex,
    // }).then((res) => {
    //   if (res.data.message === "success") {
    //     setImgSrc(res.data.data);
    setShowLoading(false);
    //   } else console.warn("获取张量热力图失败: " + res.data.message);
    // });


    var margin = {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100
    },
      width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
      height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    var color = d3.scaleOrdinal()
      .range([
        "#FFB6C1",
        "#DC143C",
        "#DA70D6",
        "#FF00FF",
        "#800080",
        "#483D8B",
        "#0000CD",
        "#00FFFF",
        "#008080",
        "#7FFFAA",
        "#00FF7F",
        "#FFFF00"
      ]);

    let radarChartOptions = {
      w: width,
      h: height,
      margin: margin,
      maxValue: 0.5,
      minValue: -0.5, // 最小值
      levels: 5,
      roundStrokes: true, // 折线图是否需要平滑处理
      color: color,
      opacityArea: 0, //The opacity of the area of the blob
      opacityCircles: 0, //The opacity of the circles of each blob
      strokeWidth: 2, //The width of the stroke around each blob
    };

    d3.csv('./radar_data_969_0_3.csv', function (error, data) {
      console.log(data);
      let numberOfPicture = Object.keys(data[0]).length - 1;
      console.log(numberOfPicture);
      let data1 = []; // n1-n8数组
      for (let i = 0; i < numberOfPicture; i++) data1[i] = [];

      for (let d of data) {
        let keys = Object.keys(d);
        for (let i = 1; i < keys.length; i++) { // 忽略第一维"index"
          let key = keys[i];

          data1[i - 1].push({
            axis: d["index"],
            value: d[key]
          });
        }
      }

      console.log(data1);
      RadarChart(".radarChart", data1, radarChartOptions);

    });
  }, [type, step, dataIndex]);

  function RadarChart(id, data, options) {
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
    console.log(minValue, maxValue);


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

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    let filter = g.append('defs').append('filter').attr('id', 'glow'),
      feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
      feMerge = filter.append('feMerge'),
      feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
      feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////
    //////////////////// Draw the axes //////////////////////
    /////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////

    //The radial line function
    // let radarLine = d3.svg.line.radial()
    //   .interpolate("linear-closed")
    //   .radius(function (d) {
    //     return rScale(d.value);
    //   })
    //   .angle(function (d, i) {
    //     return i * angleSlice;
    //   });

    // if (cfg.roundStrokes) {
    //   radarLine.interpolate("cardinal-closed");
    // }

    //Create a wrapper for the blobs	
    let blobWrapper = g.selectAll(".radarWrapper")
      .data(data)
      .enter().append("g")
      .attr("class", "radarWrapper");

    //Create the outlines	
    blobWrapper.append("path")
      .attr("class", "radarStroke")
      // .attr("d", function (d, i) {
      //   return radarLine(d);
      // })
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
      })
      .on('mouseout', function () {
        d3.select(this)
          .style("stroke-width", cfg.strokeWidth + "px")

        d3.selectAll(".radarStroke")
          .style("stroke-opacity", 1);

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

    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
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
          {!showLoading && <div className="radarChart"></div>}
        </div>
      </Popover>
    </div>
  );
};

export default TensorHeatmap;
