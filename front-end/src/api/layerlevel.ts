import fireAjax from './base'

export const fetchActivations = (params) => fireAjax('POST', '', params);
interface fetchNodeScalarsParams {
  "graph_name": string,
  "node_id": string[],
  "start_step": number,
  "end_step": number,
  "type": string,
  mode: string,
}
export const fetchNodeScalars =
  (params: fetchNodeScalarsParams): Promise<{ data }> =>
    fireAjax('GET', '/python/api/get_node_scalars', params);

interface fetchNodeTensorsParams {
  "graph_name": string,
  "node_id": string,
  "start_step": number,
  "end_step": number,
  "type": string
}

export const fetchNodeTensors =
  (params: fetchNodeTensorsParams): Promise<{ data }> =>
    fireAjax('GET', '/python/api/get_node_tensors', params);

interface fetchNodeTensorParams {
  "graph_name": string,
  "node_id": string,
  "step": number,
  "data_index": number,
  "type": string,
  "mode": string,
  "dim": number,
  "scale": boolean
}

export const fetchNodeTensor =
  (params: fetchNodeTensorParams): Promise<{ data }> =>
    fireAjax('GET', '/python/api/get_node_tensor', params);


interface fetchNodeLineDataBlueNoiceSamplingParams {
  "graph_name": string,
  "node_id": string,
  "start_step": number,
  "end_step": number,
  "type": string
}

export const fetchNodeLineDataBlueNoiceSampling =
  (params: fetchNodeLineDataBlueNoiceSamplingParams): Promise<{ data }> =>
    fireAjax('GET', '/python/api/get_node_line', params);

interface FetchClusterDataParam {
  "graph_name": string,
  "node_id": string,
  "current_step": number,
  "type": string
}
export const fetchClusterData = (params: FetchClusterDataParam): Promise<{ data }> =>
  fireAjax('GET', '/python/api/get_cluster_data', params);


interface FetchTensorHeatMapDataParam {
  "graph_name": string,
  "node_id": string,
  "step": number,
  "data_index": number,
  "type": string
}

export const fetchTensorHeatmapBase64 = (params: FetchTensorHeatMapDataParam): Promise<{ data }> =>
  fireAjax('GET', '/python/api/get_tensor_heatmap', params)