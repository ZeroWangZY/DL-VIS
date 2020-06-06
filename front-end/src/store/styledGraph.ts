import { useState, useEffect } from 'react'
import { StyledGraph } from '../common/graph-processing/stage5/styled-graph.type'

let listeners = []
let styledGraph: StyledGraph = null;

// 广播变化, 让使用了该hook的组件重新渲染
const broadcastGraphChange = () => {
  listeners.forEach(listener => {
    listener(styledGraph)
  });
}

export const setStyledGraph = (newstyledGraph: StyledGraph) => {
         styledGraph = newstyledGraph;
         broadcastGraphChange();
       };

export const useStyledGraph = () => {
  const [graph, newListener] = useState(styledGraph);

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
