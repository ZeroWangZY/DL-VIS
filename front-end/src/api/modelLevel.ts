import fireAjax from './base'
interface snaphot {
    "STEP": number, // STEP 是递增的
    "TRAIN_LOSS": number,
    "TRAIN_ACCURACY": number,
    "TEST_LOSS": number,
    "TEST_ACCURACY": number,
}
export const fetchSnaphot = (): Promise<{data: snaphot[]}> => fireAjax('GET', '/modellevel/snaphot');


interface layerInfo {
    "STEP": number, // STEP 是递增的
    "NODE_ID": number,
    "NODE_NAME": number,
    "ACTIVATION_MIN": number,
    "ACTIVATION_MAX": number,
    "ACTIVATION_MEAN": number
}
interface layerParams {
    "STEP_FROM": number,
    "STEP_TO": number,
    "NODE_ARRAY": string[]
}
export const fetchLayerInfo = (params: layerParams): Promise<{data: layerInfo[]}> => fireAjax('POST', '/modellevel/layerinfo',params);