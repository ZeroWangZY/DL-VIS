export interface GlobalStates {
  currentMSGraphName: string,
  currentStep: number,
  selectedNodeId: string,
  is_training: boolean,
  max_step: number,
}

export enum GlobalStatesModificationType {
  SET_CURRENT_MS_GRAPH_NAME,
  SET_CURRENT_STEP,
  SET_SELECTEDNODE,
  SET_IS_TRAINING,
  SET_MAX_SETP,
}
