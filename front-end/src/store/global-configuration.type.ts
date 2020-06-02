export interface GlobalConfigurations {
  diagnosisMode: boolean;
  preprocessingPlugins: { // 图处理里时应用哪些处理方式
    pruneByOutput: boolean,
    replaceVariable: boolean,
    pruneByDefaultPatterns: boolean,
    renameVariable: boolean
  },
  isHiddenInterModuleEdges: boolean;
  shouldOptimizeProcessedGraph: boolean;
  currentLayout: LayoutType
}

export enum LayoutType {
  DAGRE_FOR_TF,
  TENSORBOARD,
  DAGRE_FOR_MS,
  ELK_FOR_TF
}

export enum GlobalConfigurationsModificationType {
  TOGGLE_DIAGNOSIS_MODE,
  TOGGLE_PREPROCESSING_PLUGIN,
  SET_CURRENT_LAYOUT,
  TOGGLE_IS_HIDDEN_INTER_MODULE_EDGES,
  TOGGLE_PROCESSED_GRAPH_OPTIMIZER
}