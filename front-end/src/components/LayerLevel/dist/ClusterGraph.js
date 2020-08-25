"use strict";
exports.__esModule = true;
var react_1 = require("react");
var d3 = require("d3");
var global_states_1 = require("../../store/global-states");
var processedGraph_1 = require("../../store/processedGraph");
var ClusterGraph = function (props) {
    var clusterData = props.clusterData, clusterStep = props.clusterStep;
    var svgRef = react_1.useRef();
    var graphWidth = 310;
    var graphHeight = 310;
    var titleAreaHeight = 16; // graphHeight * 0.1;
    var chartAreaHeight = graphHeight - titleAreaHeight;
    var margin = { left: 10, right: 10, top: 5, bottom: 5 }; // 整个cluster与外层之间的margin
    var clusterWidth = graphWidth - margin.left - margin.right;
    var clusterHeight = chartAreaHeight - margin.top - margin.bottom;
    var processedGraph = processedGraph_1.useProcessedGraph();
    var nodeMap = processedGraph.nodeMap;
    var selectedNodeId = global_states_1.useGlobalStates().selectedNodeId;
    react_1.useEffect(function () {
        if (!clusterData || clusterData.length === 0 || !clusterStep)
            return;
        var dataset = clusterData;
        console.log("tsne降维后的数据: ", dataset);
        console.log(dataset);
        // 以下是绘制散点图
        var svg = d3.select(svgRef.current);
        svg.selectAll("g").remove();
        var minVal_x = d3.min(dataset, function (d) { return d[0]; }), maxVal_x = d3.max(dataset, function (d) { return d[0]; }), minVal_y = d3.min(dataset, function (d) { return d[1]; }), maxVal_y = d3.max(dataset, function (d) { return d[1]; });
        var xScale = d3.scaleLinear()
            .domain([minVal_x, maxVal_x])
            .range([0, clusterWidth]);
        var yScale = d3.scaleLinear()
            .domain([minVal_y, maxVal_y])
            .range([clusterHeight, 0]);
        //绘制圆
        var circle = svg.selectAll("g")
            .data(dataset)
            .enter()
            .append("g")
            .attr('transform', function (d) {
            var left = margin.left + xScale(d[0]);
            var top = yScale(d[1]) + margin.top;
            if (left >= chartAreaHeight - 2) {
                left = chartAreaHeight - 2;
            }
            return "translate(" + left + ", " + top + ")";
        })
            .append('circle')
            .attr("class", "cluster-circle")
            .attr("r", 2)
            .on("mouseover", function (d, i) {
            d3.select(this).attr("r", 5);
            var g = d3.select(this.parentNode);
            if (g.select('text').size() === 1) {
                g.select('text').transition().duration(500).style('visibility', 'visible');
            }
            else {
                var text = g.append('text')
                    .text("(" + i + ")")
                    .style('font-size', 14)
                    .style('visibility', 'visible');
                var _a = text.node().getBoundingClientRect(), width = _a.width, height = _a.height;
                var x = 10;
                var y = 0;
                // 判断text的位置是否超出svg的边界
                // x边界的处理
                if (margin.left + xScale(d[0]) + Math.ceil(width) + 10 >= chartAreaHeight) {
                    x = -(Math.ceil(width) + 10);
                }
                // y边界的处理
                if (yScale(d[1]) + margin.top <= Math.ceil(height)) {
                    y = (Math.ceil(height) + 5 - yScale(d[1]) - margin.top);
                }
                text.attr("x", x).attr("y", y);
            }
        })
            .on("mouseout", function (d, i) {
            d3.select(this).transition().duration(500).attr("r", 2);
            var g = d3.select(this.parentNode);
            g.select('text').transition().duration(500).style('visibility', 'hidden');
        });
    }, [clusterData, clusterStep]);
    return (react_1["default"].createElement("div", { className: "layerLevel-cluster-container", style: { height: graphHeight } },
        react_1["default"].createElement("div", { className: "layerLevel-detailInfo-title", style: {
                height: titleAreaHeight + "px",
                width: "95%",
                position: 'relative',
                left: margin.left,
                fontSize: "14px"
            } },
            react_1["default"].createElement("span", null, "投影图(" + ("" + nodeMap[selectedNodeId].displayedName) + " 迭代: " + ("" + clusterStep) + ")")),
        react_1["default"].createElement("svg", { style: { height: chartAreaHeight + "px", width: chartAreaHeight + "px" }, ref: svgRef })));
};
exports["default"] = ClusterGraph;
