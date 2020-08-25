"use strict";
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
require("./layerLevel.css");
var layerLevel_1 = require("../../store/layerLevel");
var react_router_dom_1 = require("react-router-dom");
var DetailLineChart_1 = require("./DetailLineChart");
var ActivationOrGradientChart_1 = require("./ActivationOrGradientChart");
var ClusterGraph_1 = require("./ClusterGraph");
var layerlevel_1 = require("../../api/layerlevel");
var global_states_type_1 = require("../../store/global-states.type");
var global_states_1 = require("../../store/global-states");
var processedGraph_1 = require("../../store/processedGraph");
var visGraph_1 = require("../../store/visGraph");
var processed_graph_1 = require("../../common/graph-processing/stage2/processed-graph");
var FindChildNodeUnderLayerNode_1 = require("./FindChildNodeUnderLayerNode");
var LayerLevel = function () {
    var linedata = layerLevel_1.useLineData();
    var history = react_router_dom_1.useHistory();
    var goback = function () {
        history.push("/");
    };
    var visGraph = visGraph_1.useVisGraph();
    var processedGraph = processedGraph_1.useProcessedGraph();
    var nodeMap = processedGraph.nodeMap;
    var _a = global_states_1.useGlobalStates(), selectedNodeId = _a.selectedNodeId, showActivationOrGradient = _a.showActivationOrGradient, currentMSGraphName = _a.currentMSGraphName, is_training = _a.is_training, max_step = _a.max_step, currentStep = _a.currentStep;
    var _b = react_1.useState(null), nodeTensors = _b[0], setNodeTensors = _b[1];
    var _c = react_1.useState(null), brushedStep = _c[0], setBrushedStep = _c[1];
    var _d = react_1.useState(false), brushedOrNot = _d[0], setBrushedOrNot = _d[1];
    var _e = react_1.useState(null), childNodeId = _e[0], setChildNodeId = _e[1];
    var _f = react_1.useState(null), clusterStep = _f[0], setClusterStep = _f[1];
    var _g = react_1.useState(null), clusterData = _g[0], setClusterData = _g[1];
    var _h = react_1.useState([]), activations = _h[0], setActivations = _h[1];
    var _j = react_1.useState({}), tsneGraph = _j[0], setTsneGraph = _j[1];
    var _k = react_1.useState([]), activationOrGradientData = _k[0], setActivationOrGradientData = _k[1];
    var initialBrushedStep = []; // 如果brushedOrNot===false时的初始刷选位置
    if (currentStep) {
        var end = Math.min(max_step - 1, currentStep);
        initialBrushedStep = [end - 1, end];
    }
    else {
        initialBrushedStep = [1, 2];
    }
    var _l = react_1.useState(null), detailLineChartData = _l[0], setDetailLineChartData = _l[1];
    var _m = react_1.useState(-100), minValueOfDetailLineChartData = _m[0], setMinValueOfDetailLineChartData = _m[1];
    var _o = react_1.useState(100), maxValueOfDetailLineChartData = _o[0], setMaxValueOfDetailLineChartData = _o[1];
    var fetchDataType = (showActivationOrGradient === global_states_type_1.ShowActivationOrGradient.ACTIVATION ?
        "activation" :
        "gradient");
    react_1.useEffect(function () {
        if (!(nodeMap[selectedNodeId] instanceof processed_graph_1.LayerNodeImp))
            return; // 不是layerNode 
        var _childNodeId = FindChildNodeUnderLayerNode_1.FindChildNodeUnderLayerNode(nodeMap, selectedNodeId); // findChildNodeId(selectedNodeId);
        if (_childNodeId.length === 0)
            return;
        _childNodeId = _childNodeId.slice(0, 1); // 目前截取找出的第一个元素
        setChildNodeId(_childNodeId);
    }, [selectedNodeId]);
    react_1.useEffect(function () {
        if (!childNodeId)
            return;
        getNodeScalars(currentMSGraphName, childNodeId, 1, max_step, fetchDataType);
    }, [childNodeId, currentMSGraphName, is_training, max_step, showActivationOrGradient]);
    react_1.useEffect(function () {
        console.log("brushedStep", brushedStep);
        var brushedStartStep = 1, brushedEndStep = 1;
        if (brushedOrNot === false) {
            brushedStartStep = initialBrushedStep[0], brushedEndStep = initialBrushedStep[1];
        }
        else {
            brushedStartStep = brushedStep[0], brushedEndStep = brushedStep[1];
        }
        setClusterStep(brushedStartStep);
        var maxGap = 10;
        if (brushedEndStep - brushedStartStep <= maxGap) {
            getNodeTensors(currentMSGraphName, childNodeId, brushedStartStep, brushedEndStep, fetchDataType);
            getNodeLineDataBlueNoiceSampling(currentMSGraphName, childNodeId, brushedStartStep, brushedEndStep, fetchDataType);
        }
    }, [brushedStep, brushedOrNot, currentStep]);
    react_1.useEffect(function () {
        getClusterData(currentMSGraphName, childNodeId, clusterStep, fetchDataType);
    }, [clusterStep]);
    var getNodeScalars = function (graphName, nodeIds, startStep, endStep, type) { return __awaiter(void 0, void 0, void 0, function () {
        var data, nodeScalars, max, min, mean, nodeScalar, _i, nodeScalar_1, scalar, _a, nodeScalar_2, scalar, dataTransform;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, layerlevel_1.fetchNodeScalars({ graph_name: graphName, node_id: nodeIds, start_step: startStep, end_step: endStep, type: type })];
                case 1:
                    data = _b.sent();
                    nodeScalars = data.data.data;
                    max = [], min = [], mean = [];
                    nodeScalar = nodeScalars[nodeIds[0]];
                    if (showActivationOrGradient === global_states_type_1.ShowActivationOrGradient.ACTIVATION)
                        for (_i = 0, nodeScalar_1 = nodeScalar; _i < nodeScalar_1.length; _i++) {
                            scalar = nodeScalar_1[_i];
                            max.push({ x: scalar.step, y: scalar.activation_max });
                            min.push({ x: scalar.step, y: scalar.activation_min });
                            mean.push({ x: scalar.step, y: scalar.activation_mean });
                        }
                    else if (showActivationOrGradient === global_states_type_1.ShowActivationOrGradient.GRADIENT)
                        for (_a = 0, nodeScalar_2 = nodeScalar; _a < nodeScalar_2.length; _a++) {
                            scalar = nodeScalar_2[_a];
                            max.push({ x: scalar.step, y: scalar.gradient_max });
                            min.push({ x: scalar.step, y: scalar.gradient_min });
                            mean.push({ x: scalar.step, y: scalar.gradient_mean });
                        }
                    dataTransform = [];
                    dataTransform.push({ id: "max", data: max, color: "#C71585" });
                    dataTransform.push({ id: "min", data: min, color: "#DC143C" });
                    dataTransform.push({ id: "mean", data: mean, color: "#4B0082" });
                    setActivationOrGradientData(dataTransform);
                    return [2 /*return*/];
            }
        });
    }); };
    var getClusterData = function (graphName, nodeId, currStep, type) { return __awaiter(void 0, void 0, void 0, function () {
        var data, cluster;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, layerlevel_1.fetchClusterData({ graph_name: graphName, node_id: nodeId, current_step: currStep, type: type })];
                case 1:
                    data = _a.sent();
                    cluster = data.data.data;
                    setClusterData(cluster);
                    return [2 /*return*/];
            }
        });
    }); };
    var getNodeTensors = function (graphName, nodeId, startStep, endStep, type) { return __awaiter(void 0, void 0, void 0, function () {
        var data, tensors, steps, step, vectors, i, len, vector, newVector;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, layerlevel_1.fetchNodeTensors({ graph_name: graphName, node_id: nodeId, start_step: startStep, end_step: endStep, type: type })];
                case 1:
                    data = _a.sent();
                    tensors = data.data.data;
                    steps = tensors.length;
                    for (step = 0; step < steps; step++) {
                        vectors = tensors[step];
                        for (i = 0, len = vectors.length; i < len; i++) { // 将每个vector flat为一维
                            vector = vectors[i];
                            newVector = flattenDeep(vector);
                            vectors[i] = newVector;
                        }
                    }
                    setNodeTensors(tensors);
                    return [2 /*return*/];
            }
        });
    }); };
    var getNodeLineDataBlueNoiceSampling = function (graphName, nodeId, startStep, endStep, type) { return __awaiter(void 0, void 0, void 0, function () {
        var data, originalLineData, lineNumber, dataArrToShow, i, maxValue, minValue, lineIndex, line, i, len, xValue, yValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, layerlevel_1.fetchNodeLineDataBlueNoiceSampling({ graph_name: graphName, node_id: nodeId, start_step: startStep, end_step: endStep + 1, type: type })];
                case 1:
                    data = _a.sent();
                    originalLineData = data.data.data;
                    console.log(originalLineData);
                    lineNumber = originalLineData.length;
                    dataArrToShow = [];
                    for (i = 0; i < lineNumber; i++) {
                        dataArrToShow.push({ id: "Detail_Info" + i, data: [], color: "#388aac" });
                    }
                    maxValue = -Infinity, minValue = Infinity;
                    for (lineIndex = 0; lineIndex < lineNumber; lineIndex++) {
                        line = originalLineData[lineIndex];
                        for (i = 0, len = line.length; i < len; i++) {
                            xValue = i, yValue = line[i];
                            if (yValue > maxValue)
                                maxValue = yValue;
                            if (yValue < minValue)
                                minValue = yValue;
                            dataArrToShow[lineIndex].data.push({ x: xValue, y: yValue });
                        }
                    }
                    setDetailLineChartData(dataArrToShow);
                    setMinValueOfDetailLineChartData(minValue);
                    setMaxValueOfDetailLineChartData(maxValue);
                    return [2 /*return*/];
            }
        });
    }); };
    //to enable deep level flatten use recursion with reduce and concat
    function flattenDeep(arr1) {
        return arr1.reduce(function (acc, val) { return Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val); }, []);
    }
    return (react_1["default"].createElement("div", null, nodeMap[selectedNodeId] instanceof processed_graph_1.LayerNodeImp && (react_1["default"].createElement("div", { className: "layer-container" },
        react_1["default"].createElement("div", { className: "layer-container-box detail-box" },
            react_1["default"].createElement(DetailLineChart_1["default"], { start_step: brushedOrNot === true ? brushedStep[0] : initialBrushedStep[0], end_step: brushedOrNot === true ? brushedStep[1] : initialBrushedStep[1], dataArrToShow: detailLineChartData, setClusterStep: setClusterStep, minValueOfDataToShow: minValueOfDetailLineChartData, maxValueOfDataToShow: maxValueOfDetailLineChartData })),
        react_1["default"].createElement("div", { className: "layer-container-box cluster-box" },
            react_1["default"].createElement(ClusterGraph_1["default"], { clusterData: clusterData, clusterStep: clusterStep })),
        react_1["default"].createElement("div", { className: "layer-container-box line-box" }, activationOrGradientData.length !== 0 &&
            react_1["default"].createElement(ActivationOrGradientChart_1["default"], { activationOrGradientData: activationOrGradientData, is_training: is_training, max_step: max_step, setBrushedStep: setBrushedStep, setBrushedOrNot: setBrushedOrNot }))))));
};
exports["default"] = LayerLevel;
