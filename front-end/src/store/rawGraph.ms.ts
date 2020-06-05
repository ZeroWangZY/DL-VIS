import { useState, useEffect } from 'react'
import { RawGraph } from '../common/graph-processing/stage1/raw-graph.ms.type'

let listeners = []
let msRawGraph: RawGraph = null

// 广播变化, 让使用了该hook的组件重新渲染
const broadcastGraphChange = () => {
  listeners.forEach(listener => {
    listener(msRawGraph)
  });
}

export const setMsRawGraph = (newRawGraph: RawGraph) => {
  msRawGraph = newRawGraph
  broadcastGraphChange()
}

export const useMsRawGraph = () => {
  const [graph, newListener] = useState(msRawGraph)

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
