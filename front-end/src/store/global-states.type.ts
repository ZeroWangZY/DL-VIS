export interface LayerLevelCheckBoxState {
  showMax: boolean;
  showMin: boolean;
  showMean: boolean;
}

export interface GlobalStates {
  currentMSGraphName: string,
  currentStep: number,
  selectedNodeId: string,
  isTraining: boolean,
  maxStep: number,
  layerLevel_checkBoxState: LayerLevelCheckBoxState,
  showActivationOrGradient: ShowActivationOrGradient,
  nodeScalarType: NodeScalarType,
}

export enum GlobalStatesModificationType {
  SET_CURRENT_MS_GRAPH_NAME,
  SET_CURRENT_STEP,
  SET_SELECTEDNODE,
  SET_IS_TRAINING,
  SET_MAX_STEP,
  SET_LAYERLEVEL_CHECKBOXSTATE,
  SET_SHOWACTIVATIONORGRADIENT,
  SET_NODESCALARTYPE,
}

export enum ShowActivationOrGradient {
  ACTIVATION,
  GRADIENT,
}

export enum NodeScalarType {
  ACTIVATION,
  GRADIENT,
  WEIGHT
}

export enum BottomInfoType {
  MODELINFO,
  LAYERINFO
}


