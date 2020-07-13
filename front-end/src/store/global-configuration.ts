import { useState, useEffect } from "react";
import {
  GlobalConfigurations,
  LayoutType,
  GlobalConfigurationsModificationType,
} from "./global-configuration.type";

let listeners = [];
let globalConfigurations: GlobalConfigurations = {
  diagnosisMode: false,
  conceptualGraphMode: false,
  preprocessingPlugins: {
    pruneByOutput: false,
    replaceVariable: false,
    pruneByDefaultPatterns: false,
    renameVariable: false,
  },
  isHiddenInterModuleEdges: false,
  shouldOptimizeProcessedGraph: false,
  currentLayout: LayoutType.ELK_FOR_MS,

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
    case GlobalConfigurationsModificationType.TOGGLE_DIAGNOSIS_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, {
        diagnosisMode: !globalConfigurations.diagnosisMode,
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
