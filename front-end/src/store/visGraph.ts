import { useState, useEffect } from 'react'
import { VisGraph } from '../common/graph-processing/stage3/vis-graph.type'

let listeners = []
let visGraph: VisGraph = null

// 广播变化, 让使用了该hook的组件重新渲染
const broadcastGraphChange = () => {
  listeners.forEach(listener => {
    listener(visGraph)
  });
}

export const setVisGraph = (newVisGraph: VisGraph) => {
  visGraph = newVisGraph
  broadcastGraphChange()
}

export const useVisGraph = () => {
  const [graph, newListener] = useState(visGraph)

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
