import fireAjax from './base';

export const fetchLocalMsGraph = (graphName) => fireAjax('GET', 'api/get_local_ms_graph', {graph_name: graphName} );
