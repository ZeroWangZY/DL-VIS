import { useState, useEffect } from "react";
import {
  GlobalStates,
  GlobalStatesModificationType,
} from "./global-states.type";

let listeners = [];
let globalStates: GlobalStates = {
  currentMSGraphName: null,
  currentStep: null,
  selectedNodeId: null,
  is_training: null,
  max_step: null,
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
