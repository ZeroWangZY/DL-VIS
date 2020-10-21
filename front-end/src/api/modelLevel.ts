import fireAjax from './base'

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
    mode: string,
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
    mode: string,
}
export const fetchMetadata =
    (params: fetchMetadataParams): Promise<{ data }> =>
        fireAjax('GET', '/python/api/get_metadata', params);
