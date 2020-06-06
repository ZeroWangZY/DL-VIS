import { useState, useEffect } from 'react'
import { LayoutGraph } from '../common/graph-processing/stage4/layout-graph.type'

let listeners = []
let layoutGraph: LayoutGraph = null;

// 广播变化, 让使用了该hook的组件重新渲染
const broadcastGraphChange = () => {
  listeners.forEach(listener => {
    listener(layoutGraph)
  });
}

export const setLayoutGraph = (newLayoutGraph: LayoutGraph) => {
         layoutGraph = newLayoutGraph;
         broadcastGraphChange();
       };

export const useLayoutGraph = () => {
  const [graph, newListener] = useState(layoutGraph);

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
