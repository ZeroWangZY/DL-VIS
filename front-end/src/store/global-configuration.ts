import { useState, useEffect } from 'react'

interface GlobalConfigurations {
  diagnosisMode: boolean;
  preprocessingPlugins: { // 图处理里时应用哪些处理方式
    pruneByOutput: boolean,
    replaceVariable: boolean,
    pruneByDefaultPatterns: boolean,
    renameVariable: boolean
  }
}

export enum GlobalConfigurationsModificationType {
  TOGGLE_DIAGNOSIS_MODE,
  TOGGLE_PREPROCESSING_PLUGIN
}

let listeners = []
let globalConfigurations: GlobalConfigurations = {
  diagnosisMode: true,
  preprocessingPlugins: {
    pruneByOutput: true,
    replaceVariable: true,
    pruneByDefaultPatterns: true,
    renameVariable: true
  }
};

const broadcast = () => {
  listeners.forEach(listener => {
    listener(globalConfigurations)
  });
}

export const modifyGlobalConfigurations = (operation: GlobalConfigurationsModificationType, payload: any = null) => {
  switch (operation) {
    case GlobalConfigurationsModificationType.TOGGLE_DIAGNOSIS_MODE:
      globalConfigurations = Object.assign(
        {}, 
        globalConfigurations, 
        { diagnosisMode: !globalConfigurations.diagnosisMode }
      )
      break;

    case GlobalConfigurationsModificationType.TOGGLE_PREPROCESSING_PLUGIN:
      const preprocessingPlugins = globalConfigurations["preprocessingPlugins"]
      let obj = {}
      obj[payload] = !preprocessingPlugins[payload]
      const newPreprocessingPlugins = Object.assign({}, preprocessingPlugins, obj)
      globalConfigurations = Object.assign({}, globalConfigurations, {preprocessingPlugins: newPreprocessingPlugins})
      break

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
