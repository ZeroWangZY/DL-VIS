import fireAjax from './base'

export const fetchActivations = (params) => fireAjax('POST', '', params);

interface fetchNodeScalarsParams {
  "graph_name": string,
  "node_id": string[],
  "start_step": number,
  "end_step": number
}
export const fetchNodeScalars =
  (params: fetchNodeScalarsParams): Promise<{ data }> =>
    fireAjax('GET', '/api/get_node_scalars', params);