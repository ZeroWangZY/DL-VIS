import fireAjax from './base';

export const fetchLocalMsGraph = (graphName) => fireAjax('GET', '/python/api/get_local_ms_graph', {graph_name: graphName} );
