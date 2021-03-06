import { useState, useEffect } from "react";
import {
  GlobalConfigurations,
  LayoutType,
  GlobalConfigurationsModificationType,
} from "./global-configuration.type";

let listeners = [];

let modelLevelcolorMap = new Map();
modelLevelcolorMap.set("train_loss", "#922f2c");
modelLevelcolorMap.set("test_loss", "#ca6457");
modelLevelcolorMap.set("learning_rate", "#f7b968");
modelLevelcolorMap.set("train_accuracy", "#388aac");
modelLevelcolorMap.set("test_accuracy", "#133b4e");

let layerLevelcolorMap = new Map();
layerLevelcolorMap.set("max", "#C71585");
layerLevelcolorMap.set("min", "#DC143C");
layerLevelcolorMap.set("mean", "#4B0082");

let globalConfigurations: GlobalConfigurations = {
  diagnosisMode: false,
  conceptualGraphMode: false,
  webGLMode: false,
  pixiJSMode: true,
  preprocessingPlugins: {
    pruneByOutput: false,
    replaceVariable: false,
    pruneByDefaultPatterns: false,
    renameVariable: false,
  },
  isHiddenInterModuleEdges: false,
  shouldOptimizeProcessedGraph: false,
  currentLayout: LayoutType.ELK_FOR_MS,
  modelLevelcolorMap: modelLevelcolorMap,
  layerLevelcolorMap: layerLevelcolorMap,
  isPathFindingMode: false,
  dataMode: "realtime",
};

const broadcast = () => {
  listeners.forEach((listener) => {
    listener(globalConfigurations);
  });
};

export const modifyGlobalConfigurations = (
  operation: GlobalConfigurationsModificationType,
  payload: any = null
) => {
  switch (operation) {
    case GlobalConfigurationsModificationType.SET_ISPATHFINDINGMODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        isPathFindingMode: !globalConfigurations.isPathFindingMode,
      });
      break;
    case GlobalConfigurationsModificationType.SET_DIAGNOSIS_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        diagnosisMode: true,
      });
      break;
    case GlobalConfigurationsModificationType.SET_DATA_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        dataMode: payload,
      });
      break;
    case GlobalConfigurationsModificationType.UNSET_DIAGNOSIS_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        diagnosisMode: false,
      });
      break;
    case GlobalConfigurationsModificationType.TOGGLE_DIAGNOSIS_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        diagnosisMode: !globalConfigurations.diagnosisMode,
      });
      break;
    case GlobalConfigurationsModificationType.TOGGLE_WEBGLMODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        webGLMode: !globalConfigurations.webGLMode,
      });
      break;
    case GlobalConfigurationsModificationType.TOGGLE_PIXIJSMODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        pixiJSMode: !globalConfigurations.pixiJSMode,
      });
      break;

    case GlobalConfigurationsModificationType.TOGGLE_CONCEPTUALGRAPH_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        conceptualGraphMode: !globalConfigurations.conceptualGraphMode,
      });
      break;

    case GlobalConfigurationsModificationType.TOGGLE_PREPROCESSING_PLUGIN:
      const preprocessingPlugins = globalConfigurations["preprocessingPlugins"];
      let obj = {};
      obj[payload] = !preprocessingPlugins[payload];
      const newPreprocessingPlugins = Object.assign(
        {},
        preprocessingPlugins,
        obj
      );
      globalConfigurations = Object.assign({}, globalConfigurations, {
        preprocessingPlugins: newPreprocessingPlugins,
      });
      break;

    case GlobalConfigurationsModificationType.SET_CURRENT_LAYOUT:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        currentLayout: payload,
      });
      break;

    case GlobalConfigurationsModificationType.TOGGLE_IS_HIDDEN_INTER_MODULE_EDGES:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        isHiddenInterModuleEdges: !globalConfigurations.isHiddenInterModuleEdges,
      });
      break;
    case GlobalConfigurationsModificationType.TOGGLE_PROCESSED_GRAPH_OPTIMIZER:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        shouldOptimizeProcessedGraph: !globalConfigurations.shouldOptimizeProcessedGraph,
      });
      break;
  }
  broadcast();
};

export const useGlobalConfigurations = () => {
  const [value, newListener] = useState(globalConfigurations);

  useEffect(() => {
    listeners.push(newListener);
    return () => {
      listeners = listeners.filter((listener) => listener !== newListener);
    };
  }, []);
  return value;
};
