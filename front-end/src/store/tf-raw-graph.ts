import { useState, useEffect } from 'react'
import { RawGraph } from '../common/graph-processing/tf-graph/parser'

let listeners = []
let tfRawGraph: RawGraph = null
// 广播变化, 让使用了该hook的组件重新渲染
const broadcastGraphChange = () => {
  listeners.forEach(listener => {
    listener(tfRawGraph)
  });
}

export const setTfRawGraph = (newRawGraph: RawGraph) => {
  tfRawGraph = newRawGraph
  broadcastGraphChange()
}

export const useTfRawGraph = () => {
  const [graph, newListener] = useState(tfRawGraph)

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
