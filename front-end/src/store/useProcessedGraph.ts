import { useState, useEffect } from 'react'
import { ProcessedGraph, ProcessedGraphImp } from '../types/processed-graph'

let listeners = []
let processedGraph: ProcessedGraph = new ProcessedGraphImp()

// 广播变化, 让使用了该hook的组件重新渲染
export const broadcastGraphChange = () => {
  listeners.forEach(listener => {
    listener({})
  });
}

export const setProcessedGraph = (newProcessedGraph: ProcessedGraph) => {
  processedGraph = newProcessedGraph
  broadcastGraphChange()
}

export const useProcessedGraph = () => {
  const newListener = useState()[1]

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return processedGraph
}
