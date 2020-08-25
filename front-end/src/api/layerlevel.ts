import fireAjax from './base'

export const fetchActivations = (params) => fireAjax('POST', '', params);

interface fetchNodeScalarsParams {
  "graph_name": string,
  "node_id": string[],
  "start_step": number,
  "end_step": number,
  "type": string
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
  (params: fetchNodeScalarsParams): Promise<{ data }> =>
    fireAjax('GET', '/python/api/get_node_tensors', params);


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

interface fetchClusterData {
  "graph_name": string,
  "node_id": string,
  "current_step": number,
  "type": string
}
export const fetchClusterData = (params: fetchClusterData): Promise<{ data }> =>
  fireAjax('GET', '/python/api/get_cluster_data', params);
