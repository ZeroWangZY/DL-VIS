import fireAjax from './base'
interface snaphot {
    "STEP": number, // STEP 是递增的
    "TRAIN_LOSS": number,
    "TRAIN_ACCURACY": number,
    "TEST_LOSS": number,
    "TEST_ACCURACY": number,
}
export const fetchSnaphot = (): Promise<{ data: snaphot[] }> => fireAjax('GET', '/python/api/tf/modellevel/snaphot');


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
export const fetchLayerInfo = (params: layerParams): Promise<{ data: layerInfo[] }> => fireAjax('POST', '/python/api/tf/modellevel/layerinfo', params);

interface modelScalars {
    "step": number,
    "train_loss": number,
    "test_loss": number,
    "train_accuracy": number,
    "test_accuracy": number,
    "learning_rate": number
}

interface fetchModelScalarsParams {
    "graph_name": string,
    "start_step": number,
    "end_step": number,
}
export const fetchModelScalars =
    (params: fetchModelScalarsParams): Promise<{ data }> =>
        fireAjax('GET', '/python/api/get_model_scalars', params);

interface metadata {
    "max_step": number,
    "is_training": boolean
}
interface fetchMetadataParams {
    "graph_name": string,
}
export const fetchMetadata =
    (params: fetchMetadataParams): Promise<{ data }> =>
        fireAjax('GET', '/python/api/get_metadata', params);
