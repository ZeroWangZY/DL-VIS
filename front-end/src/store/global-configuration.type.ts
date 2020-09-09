export interface GlobalConfigurations {
  diagnosisMode: boolean;
  conceptualGraphMode: boolean;
  preprocessingPlugins: {
    // 图处理里时应用哪些处理方式
    pruneByOutput: boolean;
    replaceVariable: boolean;
    pruneByDefaultPatterns: boolean;
    renameVariable: boolean;
  };
  isHiddenInterModuleEdges: boolean;
  shouldOptimizeProcessedGraph: boolean;
  currentLayout: LayoutType;
  modelLevelcolorMap: Map<string, string>;
  layerLevelcolorMap: Map<string, string>;
  isPathFindingMode: boolean;
}

export enum LayoutType {
  DAGRE_FOR_TF,
  TENSORBOARD,
  DAGRE_FOR_MS,
  ELK_FOR_TF,
  ELK_FOR_MS,
}

export enum GlobalConfigurationsModificationType {
  SET_ISPATHFINDINGMODE,
  SET_DIAGNOSIS_MODE,
  UNSET_DIAGNOSIS_MODE,
  TOGGLE_DIAGNOSIS_MODE,
  TOGGLE_CONCEPTUALGRAPH_MODE,
  TOGGLE_PREPROCESSING_PLUGIN,
  SET_CURRENT_LAYOUT,
  TOGGLE_IS_HIDDEN_INTER_MODULE_EDGES,
  TOGGLE_SHOULD_MERGE_EDGE,
  TOGGLE_PROCESSED_GRAPH_OPTIMIZER,
}
