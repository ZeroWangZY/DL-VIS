import fireAjax from './base';

export const fetchGraphData = () => fireAjax('GET', 'api/ms/get_graph');
export const fetchLocalMsGraph = (graphName) => fireAjax('GET', 'api/get_local_ms_graph', {graph_name: graphName} );
