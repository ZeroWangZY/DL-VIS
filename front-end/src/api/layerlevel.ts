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