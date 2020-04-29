import { useState, useEffect } from 'react'

interface GlobalConfigurations {
  diagnosisMode: boolean;
}

export enum GlobalConfigurationsModificationType {
  SET_DIAGNOSIS_MODE
}

let listeners = []
let globalConfigurations: GlobalConfigurations = {
  diagnosisMode: true
};

const broadcast = () => {
  listeners.forEach(listener => {
    listener(globalConfigurations)
  });
}

export const modifyGlobalConfigurations = (operation: GlobalConfigurationsModificationType, payload: any) => {
  switch (operation) {
    case GlobalConfigurationsModificationType.SET_DIAGNOSIS_MODE:
      globalConfigurations = Object.assign({}, globalConfigurations, { "diagnosisMode": payload })
      break;
    default:
      break;
  }
  broadcast()
}

export const useGlobalConfigurations = () => {
  const [value, newListener] = useState(globalConfigurations)

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return value
}
