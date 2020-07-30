import { useState, useEffect } from "react";
import {
  GlobalStates,
  GlobalStatesModificationType,
  LayerLevelCheckBoxState,
  ShowActivationOrGradient,
  NodeScalarType
} from "./global-states.type";

let listeners = [];
let checkBoxInitial: LayerLevelCheckBoxState = {
  showMax: true,
  showMin: true,
  showMean: true,
}

let globalStates: GlobalStates = {
  currentMSGraphName: null,
  currentStep: null,
  selectedNodeId: null,
  is_training: null,
  max_step: null,
  layerLevel_checkBoxState: checkBoxInitial,
  showActivationOrGradient: ShowActivationOrGradient.ACTIVATION,
  nodeScalarType: NodeScalarType.ACTIVATION
};

const broadcast = () => {
  listeners.forEach((listener) => {
    listener(globalStates);
  });
};

export const modifyGlobalStates = (
  operation: GlobalStatesModificationType,
  payload: any = null
) => {
  switch (operation) {
    case GlobalStatesModificationType.SET_CURRENT_STEP:
      globalStates = Object.assign({}, globalStates, {
        currentStep: payload,
      });
      break;
    case GlobalStatesModificationType.SET_SELECTEDNODE:
      globalStates = Object.assign({}, globalStates, {
        selectedNodeId: payload,
      });
      break;
    case GlobalStatesModificationType.SET_IS_TRAINING:
      globalStates = Object.assign({}, globalStates, {
        is_training: payload,
      });
      break;
    case GlobalStatesModificationType.SET_MAX_SETP:
      globalStates = Object.assign({}, globalStates, {
        max_step: payload,
      });
      break;
    case GlobalStatesModificationType.SET_CURRENT_MS_GRAPH_NAME:
      globalStates = Object.assign({}, globalStates, {
        currentMSGraphName: payload,
      });
      break;
    case GlobalStatesModificationType.SET_LAYERLEVEL_CHECKBOXSTATE:
      globalStates = Object.assign({}, globalStates, {
        layerLevel_checkBoxState: payload,
      });
      break;
    case GlobalStatesModificationType.SET_SHOWACTIVATIONORGRADIENT:
      globalStates = Object.assign({}, globalStates, {
        showActivationOrGradient: payload,
      });
      break;
    case GlobalStatesModificationType.SET_NODESCALARTYPE:
      globalStates = Object.assign({}, globalStates, {
        nodeScalarType: payload,
      });
      break;
    default:
      break;
  }
  broadcast();
};

export const useGlobalStates = () => {
  const [value, newListener] = useState(globalStates);

  useEffect(() => {
    listeners.push(newListener);
    return () => {
      listeners = listeners.filter((listener) => listener !== newListener);
    };
  }, []);
  return value;
};
