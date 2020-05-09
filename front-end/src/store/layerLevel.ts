import { useState, useEffect } from 'react'
import { LineChartType ,LineChartImp,ModifyLineData } from '../types/layerLevel'
let lineChartData:LineChartType[] = []
let lineListeners = []

export const broadLineChange = () => {
    lineChartData =  [...lineChartData]
    lineListeners.forEach(listener => {
      listener(lineChartData)
    });
} 
export const useLineData = () => {
    const [data, newListener] = useState(lineChartData)
    useEffect(() => {
        lineListeners.push(newListener)
      return () => {
        lineListeners = lineListeners.filter(listener => listener !== newListener)
      }
    }, [])
    return data
}
export const modifyData = (action: ModifyLineData, data: LineChartType[]) => {
  switch (action) {
    case ModifyLineData.UPDATE_Line:
         lineChartData =  [...data]
        break;
  }
  broadLineChange()
}
