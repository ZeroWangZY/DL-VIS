import { useState, useEffect } from 'react'
import { ProcessedGraph, ProcessedGraphImp } from '../types/processed-graph'

let listeners = []
let processedGraph: ProcessedGraph = new ProcessedGraphImp()

// 广播变化, 让使用了该hook的组件重新渲染
export const broadcastGraphChange = () => {
  processedGraph = Object.assign(new ProcessedGraphImp(), processedGraph)
  listeners.forEach(listener => {
    listener(processedGraph)
  });
}

export const setProcessedGraph = (newProcessedGraph: ProcessedGraph) => {
  processedGraph = newProcessedGraph
  broadcastGraphChange()
}

export const useProcessedGraph = () => {
  const [graph, newListener] = useState(processedGraph)

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
