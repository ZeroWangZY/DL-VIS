"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var d3 = require("d3");
var global_states_1 = require("../../store/global-states");
var global_configuration_1 = require("../../store/global-configuration");
var styles_1 = require("@material-ui/core/styles");
var global_states_type_1 = require("../../store/global-states.type");
require("./ActivationOrGradientChart.css");
var FormGroup_1 = require("@material-ui/core/FormGroup");
var FormControlLabel_1 = require("@material-ui/core/FormControlLabel");
var Typography_1 = require("@material-ui/core/Typography");
var Checkbox_1 = require("@material-ui/core/Checkbox");
var Snapshot_1 = require("../Snapshot/Snapshot");
var useStyles = styles_1.makeStyles({
    root: {
        minWidth: 275
    },
    title: {
        fontSize: 14,
        color: "white",
        textAlign: "left"
    }
});
// TODO: 在调用此组件的时候就告诉它准确的宽和高。
var ActivationOrGradientChart = function (props) {
    var activationOrGradientData = props.activationOrGradientData, max_step = props.max_step, setBrushedStep = props.setBrushedStep, setBrushedOrNot = props.setBrushedOrNot;
    var _a = global_states_1.useGlobalStates(), layerLevel_checkBoxState = _a.layerLevel_checkBoxState, currentStep = _a.currentStep;
    var layerLevelcolorMap = global_configuration_1.useGlobalConfigurations().layerLevelcolorMap;
    var classes = useStyles();
    var svgRef = react_1.useRef();
    var zoomRef = react_1.useRef();
    var brushGRef = react_1.useRef();
    var _b = react_1.useState(650), svgWidth = _b[0], setSvgWidth = _b[1];
    var _c = react_1.useState(162), svgHeight = _c[0], setSvgHeight = _c[1];
    var _d = react_1.useState(null), cursorLinePos = _d[0], setCursorLinePos = _d[1];
    var _e = react_1.useState(null), localCurrentStep = _e[0], setLocalCurrentStep = _e[1];
    var _f = react_1.useState(null), fixCursorLinePos = _f[0], setFixCursorLinePos = _f[1];
    var _g = react_1.useState(true), isMousemove = _g[0], setIsMouseMove = _g[1];
    var _h = react_1.useState(activationOrGradientData), dataArrToShow = _h[0], setDataArrToShow = _h[1];
    var _j = react_1.useState([]), DetailInfoOfCurrentStep = _j[0], setDetailInfoOfCurrentStep = _j[1];
    var _k = react_1.useState(null), showDomain = _k[0], setShowDomain = _k[1];
    var measuredRef = react_1.useCallback(function (node) {
        if (node !== null) {
            setSvgWidth(node.getBoundingClientRect().width - 70);
            setSvgHeight(node.getBoundingClientRect().height);
        }
    }, []);
    // let XScale = d3.scaleLinear()
    //   .rangeRound([0, svgWidth])
    //   .domain([1, max_step]);
    var titleAreaHeight = svgHeight * 0.1;
    var chartAreaHeight = svgHeight - titleAreaHeight;
    // 下面这些都是chart Area中的宽高
    var margin = { top: 4, left: 40, bottom: 0, right: 40 };
    var gapHeight = 20; // 上下折线图之间的距离
    var height = (chartAreaHeight - margin.top - margin.bottom - gapHeight * 2) * 5 / 7;
    var margin2 = { top: height + margin.top + gapHeight, left: margin.left };
    var height2 = (chartAreaHeight - margin.top - margin.bottom - gapHeight * 2) * 2 / 7;
    var filterData = function (newcheckBoxState) {
        var dataSlice = [];
        Object.values(newcheckBoxState).forEach(function (state, i) {
            if (state)
                dataSlice.push(activationOrGradientData[i]);
        });
        return dataSlice;
    };
    var handleChange = function (event) {
        var _a;
        var newcheckBoxState = {};
        // 保证至少有一个checkBox被选中
        var stateArr = Object.values(layerLevel_checkBoxState);
        var count = 0;
        for (var _i = 0, stateArr_1 = stateArr; _i < stateArr_1.length; _i++) {
            var state = stateArr_1[_i];
            if (state)
                count++;
            if (count > 1)
                break;
        }
        if (count === 1 && !event.target.checked)
            return;
        Object.assign(newcheckBoxState, __assign(__assign({}, layerLevel_checkBoxState), (_a = {}, _a[event.target.name] = event.target.checked, _a)));
        setDataArrToShow(filterData(newcheckBoxState));
        global_states_1.modifyGlobalStates(global_states_type_1.GlobalStatesModificationType.SET_LAYERLEVEL_CHECKBOXSTATE, newcheckBoxState);
    };
    react_1.useEffect(function () {
        setDataArrToShow(filterData(layerLevel_checkBoxState));
    }, activationOrGradientData);
    react_1.useEffect(function () {
        //console.log('useEffect: ', isMousemove);
        computeAndDrawLine();
    }, [dataArrToShow, svgWidth, currentStep]);
    var computeAndDrawLine = function () { return __awaiter(void 0, void 0, void 0, function () {
        var focus, context, bisect, dataExample, minY, maxY, i, LineData, j, point, x1Scale, x2Scale, focusAreaYScale, contextAreaYScale, focusAreaLineGenerator, contextAreaLineGenerator, i, data, i, data, brushed, brushG, focusBrushStep, focusBrushended, isSameArray, brushSelection, focusBrushHandler, focusBrushStart, focusBrush, brush, showRange, mouseMoveHandler;
        return __generator(this, function (_a) {
            if (!max_step || dataArrToShow.length === 0)
                return [2 /*return*/];
            focus = d3.select(svgRef.current).select("g.layerLevel-lineChart-focus");
            focus.select('.focus-axis').selectAll(".axis--y").remove(); // 清除原来的坐标
            focus.select('.focus-axis').selectAll(".axis--x").remove(); // 清除原来的坐标
            focus.select('.focus-axis').selectAll(".area").remove(); // 清除原折线图
            context = d3.select(svgRef.current).select("g.layerLevel-lineChart-context");
            context.selectAll(".axis--x").remove(); // 清除原来的坐标
            context.selectAll(".axis--y").remove(); // 清除原来的坐标
            context.selectAll(".area").remove(); // 清除原折线图
            context.selectAll(".brush").remove();
            if (dataArrToShow.length === 0)
                return [2 /*return*/];
            bisect = d3.bisector(function (d) { return d.x; }).left;
            dataExample = dataArrToShow[0];
            minY = Infinity, maxY = -Infinity;
            for (i = 0; i < dataArrToShow.length; i++) {
                LineData = dataArrToShow[i].data;
                for (j = 1; j < max_step; j++) {
                    point = LineData[j];
                    if (!point)
                        continue;
                    minY = Math.min(minY, point.y);
                    maxY = Math.max(maxY, point.y);
                }
            }
            x1Scale = d3.scaleLinear()
                .rangeRound([0, svgWidth])
                .domain([1, max_step]);
            x2Scale = d3.scaleLinear()
                .rangeRound([0, svgWidth])
                .domain([1, max_step]);
            focusAreaYScale = d3.scaleLinear()
                .rangeRound([height, 0])
                .domain([minY, maxY]);
            contextAreaYScale = d3.scaleLinear()
                .rangeRound([height2, 0])
                .domain([minY, maxY]);
            focusAreaLineGenerator = d3
                .line()
                .curve(d3.curveMonotoneX)
                .x(function (d) { return x1Scale(d.x); })
                .y(function (d) { return focusAreaYScale(d.y); });
            contextAreaLineGenerator = d3
                .line()
                .curve(d3.curveMonotoneX)
                .x(function (d) { return x2Scale(d.x); })
                .y(function (d) { return contextAreaYScale(d.y); });
            for (i = 0; i < dataArrToShow.length; i++) {
                data = dataArrToShow[i];
                focus
                    .select('.focus-axis')
                    .append("path")
                    .datum(data.data)
                    .attr("class", "area")
                    .attr("d", focusAreaLineGenerator)
                    .attr("fill", "none")
                    .attr("stroke", data.color);
            }
            focus
                .select('.focus-axis')
                .append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x1Scale));
            focus
                .select('.focus-axis')
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
            focus
                .select('g.activationOrGradient-grid')
                .call(d3.axisLeft(focusAreaYScale).tickSize(-svgWidth))
                .selectAll("text")
                .style("opacity", "0");
            for (i = 0; i < dataArrToShow.length; i++) {
                data = dataArrToShow[i];
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
            brushed = function () {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom")
                    return; // ignore brush-by-zoom
                var s = d3.event.selection || x2Scale.range();
                x1Scale.domain(s.map(x2Scale.invert, x2Scale));
                if (currentStep)
                    setFixCursorLinePos(x1Scale(currentStep));
                setShowDomain(s.map(x2Scale.invert, x2Scale)); // 设定brush选定显示区域的domain;
                // const t1 = focus.transition().duration(750);
                var xAxis = d3.axisBottom(x1Scale);
                focus.select('.focus-axis').selectAll(".area").attr("d", focusAreaLineGenerator);
                focus.select('.focus-axis').select(".axis--x").call(xAxis);
            };
            brushG = brushGRef.current;
            focusBrushStep = 10;
            focusBrushended = function () {
                var selection = d3.event.selection;
                if (!selection) {
                    return;
                }
                // 添加mousemove
                setIsMouseMove(true);
                d3.select(svgRef.current)
                    .select(".layerLevel-lineChart-zoom-g")
                    .on("mousemove", mouseMoveHandler);
                // 触发mouseup事件
                // d3.select(svgRef.current)
                //   .select(".layerLevel-lineChart-zoom-g")
                //   .dispatch('mouseup');
                // 删除focus brush
                d3.select(brushGRef.current).select('.focusBrush').call(focusBrush.move, null);
                //console.log('brush end: ', isMousemove);
                var s = selection.slice().map(x1Scale.invert, x1Scale);
                if (Math.abs(s[0] - s[1]) < 1 && Math.floor(s[0]) === Math.floor(s[1])) { // 刷选距离小于1，且中间没有包含任何step
                    var begStep = Math.round(s[0]);
                    global_states_1.modifyGlobalStates(global_states_type_1.GlobalStatesModificationType.SET_CURRENT_STEP, begStep);
                    s[0] = Math.max(1, begStep); // 不能小于1
                    s[0] = Math.min(max_step - 1, s[0]); // 不能大于 max_step-1
                    s[1] = Math.min(max_step - 1, s[0] + 1);
                }
                else {
                    s[0] = Math.ceil(s[0]);
                    s[1] = Math.floor(s[1]);
                    s = s.sort(function (a, b) { return a - b; });
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
            isSameArray = function (a, b) {
                return a[0] === b[0] && a[1] === b[1];
            };
            brushSelection = [-1, -1];
            focusBrushHandler = function () {
                var selection = d3.event.selection;
                if (!selection) {
                    return;
                }
                var s = selection.slice();
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
            focusBrushStart = function () {
                var selection = d3.event.selection;
                if (!selection) {
                    return;
                }
                // cancel mousemove and add brush after this is clicked.
                setIsMouseMove(false);
                setCursorLinePos(null);
            };
            focusBrush = d3
                .brushX()
                .extent([
                [0, 0],
                [svgWidth, height],
            ])
                .on('start', focusBrushStart)
                .on('brush', focusBrushHandler)
                .on("end", focusBrushended);
            d3.select(brushG).select('.focusBrush').call(focusBrush);
            brush = d3
                .brushX()
                .extent([
                [0, 0],
                [svgWidth, height2],
            ])
                .on("brush end", brushed);
            showRange = [];
            if (showDomain === null)
                showRange = x2Scale.range();
            else
                showRange = [x2Scale(showDomain[0]), x2Scale(showDomain[1])];
            context
                .append("g")
                .attr("class", "brush")
                .call(brush)
                .call(brush.move, showRange);
            mouseMoveHandler = function () {
                var mouseX = d3.mouse(this)[0];
                var x = x1Scale.invert(mouseX);
                var _index = bisect(dataExample.data, x, 1);
                _index = _index === 0 ? 1 : _index;
                // 因为data中是[1, max_step]的数组,共max_step-1个数
                // 而数组从0开始存储，所以数组中是[0, max_step-1)
                // 所以_index最大是 max_step - 2
                if (_index === max_step - 1)
                    _index = max_step - 2;
                var index = x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
                    ? _index
                    : _index - 1;
                var clickNumber = dataExample.data[index].x;
                setLocalCurrentStep(clickNumber);
                setCursorLinePos(x1Scale(clickNumber));
                var newDetailInfoOfCurrentStep = [];
                for (var i = 0; i < dataArrToShow.length; i++) {
                    newDetailInfoOfCurrentStep.push({
                        "name": dataArrToShow[i].id,
                        "value": dataArrToShow[i].data[clickNumber - 1].y
                    });
                }
                setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
            };
            d3.select(svgRef.current)
                .select(".layerLevel-lineChart-zoom-g")
                .on("mousemove", function () {
                var mouseX = d3.mouse(this)[0];
                var x = x1Scale.invert(mouseX);
                var _index = bisect(dataExample.data, x, 1);
                _index = _index === 0 ? 1 : _index;
                // 因为data中是[1, max_step]的数组,共max_step-1个数
                // 而数组从0开始存储，所以数组中是[0, max_step-1)
                // 所以_index最大是 max_step - 2
                if (_index === max_step - 1)
                    _index = max_step - 2;
                if (0 <= (_index - 1) && _index < dataExample.data.length) {
                    var index = x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
                        ? _index
                        : _index - 1;
                    var clickNumber = dataExample.data[index].x;
                    setLocalCurrentStep(clickNumber);
                    setCursorLinePos(x1Scale(clickNumber));
                    var newDetailInfoOfCurrentStep = [];
                    for (var i = 0; i < dataArrToShow.length; i++) {
                        newDetailInfoOfCurrentStep.push({
                            "name": dataArrToShow[i].id,
                            "value": dataArrToShow[i].data[clickNumber - 1].y
                        });
                    }
                    setDetailInfoOfCurrentStep(newDetailInfoOfCurrentStep);
                }
            })
                .on("mouseleave", function () {
                setLocalCurrentStep(null);
                setCursorLinePos(null);
            })
                .on("click", function () {
                // cancel mousemove and add brush after this is clicked.
                setIsMouseMove(false);
                setCursorLinePos(null);
                // 为focus添加brush
                d3.select(brushG).append('g')
                    .attr('class', 'focusBrush')
                    .call(focusBrush);
                var mouseX = d3.mouse(this)[0];
                var x = x1Scale.invert(mouseX);
                var _index = bisect(dataExample.data, x, 1);
                _index = _index === 0 ? 1 : _index;
                // 因为data中是[1, max_step]的数组,共max_step-1个数
                // 而数组从0开始存储，所以数组中是[0, max_step-1)
                // 所以_index最大是 max_step - 2
                if (_index === max_step - 1)
                    _index = max_step - 2;
                if (0 <= (_index - 1) && _index < dataExample.data.length) {
                    var index = x - dataExample.data[_index - 1].x > dataExample.data[_index].x - x
                        ? _index
                        : _index - 1;
                    var clickNumber = dataExample.data[index].x;
                    global_states_1.modifyGlobalStates(global_states_type_1.GlobalStatesModificationType.SET_CURRENT_STEP, clickNumber);
                    setFixCursorLinePos(x1Scale(clickNumber));
                }
            });
            return [2 /*return*/];
        });
    }); };
    var getDetailInfoRect = function (xPos, height) {
        var fontSize = 14;
        var contextHeight = (fontSize + 2) * (DetailInfoOfCurrentStep.length + 1); // 16 为字体大小
        var contextWidth = 150;
        var containerWidth = contextWidth + 10, containerHeight = contextHeight + 10;
        if (xPos + containerWidth > svgWidth)
            xPos = xPos - containerWidth - 20; // 靠近右边界，将这一部分放到竖线前面显示
        else
            xPos += 10; // gap
        return (react_1["default"].createElement("foreignObject", { x: xPos, y: height / 2 - contextHeight / 2 - 10, width: containerWidth + 10, height: contextHeight + 40 },
            react_1["default"].createElement("div", { className: "DetailInfoContainer" },
                react_1["default"].createElement("div", { className: classes.title, style: { marginLeft: '23px' } }, "iteration: " + localCurrentStep),
                DetailInfoOfCurrentStep.map(function (d, i) { return (react_1["default"].createElement("div", { style: { display: 'flex', alignItems: 'center' } },
                    react_1["default"].createElement("span", { className: "DotBeforeDetailInfo", style: { background: layerLevelcolorMap.get(d.name), float: 'left' } }),
                    react_1["default"].createElement("div", { className: classes.title, style: { display: 'inline-block', float: 'left' } },
                        d.value === null && (d.name + ": null"),
                        d.value !== null &&
                            (d.name + ": " + Snapshot_1.toExponential(d.value))),
                    react_1["default"].createElement("div", { style: { clear: 'both' } }))); }))));
    };
    return (react_1["default"].createElement("div", { className: "layerLevel-lineChart-container", ref: measuredRef, style: { userSelect: 'none', height: "100%" } },
        react_1["default"].createElement("div", { className: "layerLevel-lineChart-checkbox", style: { height: titleAreaHeight + "px", width: "70%", position: 'relative', top: "-10px", left: margin.left } },
            react_1["default"].createElement(FormGroup_1["default"], { row: true },
                react_1["default"].createElement(FormControlLabel_1["default"], { control: react_1["default"].createElement(Checkbox_1["default"], { style: { color: layerLevelcolorMap.get("max") }, checked: layerLevel_checkBoxState.showMax, onChange: handleChange, name: "showMax" }), label: react_1["default"].createElement(Typography_1["default"], { style: { fontSize: "14px" } }, "max") }),
                react_1["default"].createElement(FormControlLabel_1["default"], { control: react_1["default"].createElement(Checkbox_1["default"], { style: { color: layerLevelcolorMap.get("min") }, checked: layerLevel_checkBoxState.showMin, onChange: handleChange, name: "showMin" }), label: react_1["default"].createElement(Typography_1["default"], { style: { fontSize: "14px" } }, "min") }),
                react_1["default"].createElement(FormControlLabel_1["default"], { control: react_1["default"].createElement(Checkbox_1["default"], { style: { color: layerLevelcolorMap.get("mean") }, checked: layerLevel_checkBoxState.showMean, onChange: handleChange, name: "showMean" }), label: react_1["default"].createElement(Typography_1["default"], { style: { fontSize: "14px" } }, "mean") }))),
        react_1["default"].createElement("svg", { style: { height: chartAreaHeight + "px", width: "100%" }, ref: svgRef },
            react_1["default"].createElement("defs", null,
                react_1["default"].createElement("clipPath", { id: "clip" },
                    react_1["default"].createElement("rect", { width: svgWidth, height: height }))),
            react_1["default"].createElement("g", { className: "layerLevel-lineChart-focus", transform: "translate(" + margin.left + "," + margin.top + ")" },
                react_1["default"].createElement("g", { className: "activationOrGradient-grid" }),
                react_1["default"].createElement("g", { className: "focus-axis" }),
                cursorLinePos !== null && (react_1["default"].createElement("line", { x1: cursorLinePos, x2: cursorLinePos, y1: height, y2: 0, style: {
                        stroke: "grey",
                        strokeWidth: 1
                    } })),
                cursorLinePos !== null && DetailInfoOfCurrentStep.length &&
                    getDetailInfoRect(cursorLinePos, height),
                fixCursorLinePos !== null && (react_1["default"].createElement("line", { x1: fixCursorLinePos, x2: fixCursorLinePos, y1: height, y2: 0, style: {
                        stroke: "grey",
                        strokeWidth: 1
                    } }))),
            react_1["default"].createElement("g", { className: "layerLevel-lineChart-zoom-g", transform: "translate(" + margin.left + "," + margin.top + ")" },
                react_1["default"].createElement("g", { ref: brushGRef },
                    react_1["default"].createElement("rect", { className: "layerLevel-lineChart-zoom", width: svgWidth, height: height, ref: zoomRef }),
                    react_1["default"].createElement("g", { className: "focusBrush" }))),
            react_1["default"].createElement("g", { className: "layerLevel-lineChart-context", transform: "translate(" + margin2.left + "," + margin2.top + ")" }))));
};
exports["default"] = ActivationOrGradientChart;
