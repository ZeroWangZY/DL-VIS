"use strict";
exports.__esModule = true;
var react_1 = require("react");
var d3 = require("d3");
var global_states_1 = require("../../store/global-states");
var global_configuration_1 = require("../../store/global-configuration");
require("./ActivationOrGradientChart.css");
var DetailLineChart = function (props) {
    var start_step = props.start_step, end_step = props.end_step, dataArrToShow = props.dataArrToShow, setClusterStep = props.setClusterStep, maxValueOfDataToShow = props.maxValueOfDataToShow, minValueOfDataToShow = props.minValueOfDataToShow;
    var _a = global_states_1.useGlobalStates(), layerLevel_checkBoxState = _a.layerLevel_checkBoxState, currentStep = _a.currentStep, max_step = _a.max_step;
    var layerLevelcolorMap = global_configuration_1.useGlobalConfigurations().layerLevelcolorMap;
    var svgRef = react_1.useRef();
    var zoomRef = react_1.useRef();
    var _b = react_1.useState(650), svgWidth = _b[0], setSvgWidth = _b[1];
    var _c = react_1.useState(140), svgHeight = _c[0], setSvgHeight = _c[1];
    var measuredRef = react_1.useCallback(function (node) {
        if (node !== null) {
            setSvgWidth(node.getBoundingClientRect().width);
            setSvgHeight(node.getBoundingClientRect().height);
        }
    }, []);
    var titleAreaHeight = svgHeight * 0.1;
    var chartAreaHeight = svgHeight - titleAreaHeight;
    var margin = { top: 15, left: 40, bottom: 5, right: 40 }; // chart与外层之间的margin
    var chartHeight = chartAreaHeight - margin.top - margin.bottom; // chart的高度
    var chartWidth = svgWidth - margin.left - margin.right;
    react_1.useEffect(function () {
        if (start_step < 0 || end_step < 0 || !start_step || !end_step)
            return;
        if (!dataArrToShow || dataArrToShow.length === 0)
            return;
        console.log(start_step, end_step);
        DrawLineChart(minValueOfDataToShow, maxValueOfDataToShow, dataArrToShow);
    }, [dataArrToShow, minValueOfDataToShow, maxValueOfDataToShow, svgWidth]);
    var DrawLineChart = function (minValue, maxValue, dataArrToShow) {
        var totalSteps = end_step - start_step + 1;
        var ticksBetweenTwoSteps = dataArrToShow[0].data.length / totalSteps;
        var svg = d3.select(svgRef.current);
        var focus = svg.select("g.layerLevel-detailInfo-focus");
        focus.selectAll(".axis--y").remove(); // 清除原来的坐标
        focus.selectAll(".axis--x").remove(); // 清除原来的坐标
        focus.selectAll(".layerLevel-detailInfo-area").remove(); // 清除原折线图
        focus.selectAll(".detailLineChart-grid").remove();
        svg.selectAll(".layerLevel-detailInfo-text").remove();
        svg.selectAll(".layerLevel-detailInfo-yAxisLine").remove();
        var bisect = d3.bisector(function (d) { return d.x; }).left;
        //拿第一组数据查询
        var dataExample = dataArrToShow[0];
        var xScale = d3.scaleLinear()
            .range([0, chartWidth])
            .domain([0, dataArrToShow[0].data.length]);
        var yScale = d3.scaleLinear()
            .range([chartHeight, 0])
            .domain([minValue, maxValue]);
        var focusAreaLineGenerator = d3
            .line()
            .curve(d3.curveMonotoneX)
            .x(function (d) { return xScale(d.x); })
            .y(function (d) { return yScale(d.y); });
        svg.select(".layerLevel-detailInfo-zoom")
            .on("click", function () {
            var mouseX = d3.mouse(this)[0];
            var x = xScale.invert(mouseX);
            var _index = bisect(dataExample.data, x, 1);
            setClusterStep(Math.floor(_index / ticksBetweenTwoSteps) + start_step);
        });
        var _loop_1 = function (i, len) {
            var data = dataArrToShow[i];
            focus
                .append("path")
                .datum(data.data)
                .attr("class", "layerLevel-detailInfo-area")
                .attr("d", focusAreaLineGenerator)
                .attr("stroke", data.color)
                .attr("stroke-width", 1)
                .on("mouseover", function (d) {
                d3.select(this)
                    .attr("stroke-width", 2)
                    .attr("stroke", "red");
                var mouseX = d3.mouse(this)[0];
                var mouseY = d3.mouse(this)[1];
                var x = xScale.invert(mouseX);
                var _index = bisect(dataExample.data, x, 1);
                console.log(_index);
                getLineInfoLabel(xScale(_index), mouseY, i, _index);
            })
                .on("mouseout", function (d) {
                d3.select(this)
                    .attr("stroke", data.color)
                    .attr("stroke-width", 1);
                focus.selectAll(".layerLevel-detailInfo-area-text").remove();
            });
        };
        for (var i = 0, len = dataArrToShow.length; i < len; i++) {
            _loop_1(i, len);
        }
        function getLineInfoLabel(xPos, yPos, i, index) {
            focus.selectAll(".layerLevel-detailInfo-area-text").remove();
            focus.append('text')
                .attr("class", "layerLevel-detailInfo-area-text")
                .attr("x", xPos)
                .attr("y", yPos)
                .text("(" + index + ")")
                .style('font-size', 14)
                .style('visibility', 'visible');
        }
        // 需要竖线数量：刷选得到的数据范围是：[start_step, Math.min(end_step, max_step-1)]
        // 坐标刻度为 ： start_step , .... Math.min(end_step, max_step-1)
        // Math.min(end_step, max_step-1) === start_step时，不画线，直接标上值
        svg.append("text")
            .attr("class", "layerLevel-detailInfo-text")
            .text("" + start_step)
            .attr("x", margin.left)
            .attr("y", margin.top - 2)
            .attr("text-anchor", "middle");
        if (Math.min(end_step, max_step - 1) !== start_step) {
            var numberOfLineToDraw = Math.min(end_step, max_step - 1) - start_step; // 比如[345,346],还需要画1根线
            var widthBetweenToLines = chartWidth / (numberOfLineToDraw + 1);
            for (var i = 1; i <= numberOfLineToDraw; i++) {
                var xPos = margin.left + widthBetweenToLines * i;
                // 长度为 chartHeight
                svg.append("text")
                    .attr("class", "layerLevel-detailInfo-text")
                    .text("" + (start_step + i))
                    .attr("x", xPos)
                    .attr("y", margin.top - 2)
                    .attr("text-anchor", "middle");
                svg.append("line")
                    .attr("class", "layerLevel-detailInfo-yAxisLine")
                    .attr("x1", xPos)
                    .attr("y1", margin.top)
                    .attr("x2", xPos)
                    .attr("y2", margin.top + chartHeight);
            }
        }
        focus
            .append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(yScale));
        var yGrid = focus.append("g").attr("class", "detailLineChart-grid");
        yGrid.selectAll("path.domain").remove(); // 删除横线。
    };
    return (react_1["default"].createElement("div", { className: "layerLevel-detailInfo-container", ref: measuredRef, style: { userSelect: 'none', height: "100%" } },
        react_1["default"].createElement("div", { className: "layerLevel-detailInfo-title", style: {
                height: titleAreaHeight + "px",
                position: 'relative',
                left: margin.left,
                fontSize: "14px"
            } }, "\u6570\u636E\u5B9E\u4F8B\u6307\u6807\u53D8\u5316\u56FE"),
        react_1["default"].createElement("svg", { style: { height: chartAreaHeight + "px", width: "100%" }, ref: svgRef },
            react_1["default"].createElement("g", null,
                react_1["default"].createElement("rect", { className: "layerLevel-detailInfo-zoom", width: chartWidth, height: chartHeight, transform: "translate(" + margin.left + "," + margin.top + ")" })),
            react_1["default"].createElement("g", { className: "layerLevel-detailInfo-focus", transform: "translate(" + margin.left + "," + margin.top + ")" }))));
};
exports["default"] = DetailLineChart;
