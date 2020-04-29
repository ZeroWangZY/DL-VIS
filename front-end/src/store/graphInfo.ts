import { useState, useEffect } from 'react'
import { transformData, transformImp, elModifyType, TransformType } from '../types/mini-map'
let graphListeners = []
let transListeners = []
let graphInfo: any = null
let transform:transformData = new transformImp()

export const broadGraphChange = () => {
    graphInfo =  graphInfo.cloneNode(true)
    graphListeners.forEach(listener => {
      listener(graphInfo)
    });
} 
export const useGraphInfo = () => {
    const [el, newListener] = useState(graphInfo)
    useEffect(() => {
      graphListeners.push(newListener)
      return () => {
        graphListeners = graphListeners.filter(listener => listener !== newListener)
      }
    }, [])
    return el
}
export const modifyGraphInfo = (action: elModifyType) => {
  switch (action) {
    case elModifyType.UPDATE_NODE:
        graphInfo = document.getElementById('output-svg')
        break;
  }
  broadGraphChange()
}



export const broadTransformChange = () => {
  transform = Object.assign(new transformImp(), transform)
  transListeners.forEach(listener => {
    listener(transform)
  });
} 
export const useTransform = () => {
  const [transformData, newListener] = useState(transform)
  useEffect(() => {
    transListeners.push(newListener)
    return () => {
      transListeners = transListeners.filter(listener => listener !== newListener)
    }
  }, [])
  return transformData
}

export const setTransform = (action: TransformType, newTransform:transformData) => {
  switch (action) {
    case TransformType.GRAPH_TRANSFORM:
        transform = newTransform
        break;
    case TransformType.MAP_TRANSFORM:
        transform = newTransform
        break;
  }
  broadTransformChange()
}