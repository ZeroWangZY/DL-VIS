import  { fetchSnaphot,fetchLayerInfo } from '../../api/modelLevel'

export const fetchAndComputeSnaphot = async () => {
    let data = await fetchSnaphot()
    let line = data.data.map(d => {
        return{
            x: d.STEP,
            y: d.TRAIN_LOSS
        }
    })
    return [{ id: 'snapshot', data: line, color: '#9ecae1' }]
}

export const fetchAndGetLayerInfo = async (params) => {
    let nodeId = params.NODE_ARRAY.join('-')
    try{
    let data = await fetchLayerInfo(params)
    let mean=[] , max=[], min=[]
    data.data.map(d => {
        mean.push({
            x: d.STEP,
            y: d.ACTIVATION_MEAN
        })
        max.push({
            x: d.STEP,
            y: d.ACTIVATION_MAX
        })
        min.push({
            x: d.STEP,
            y: d.ACTIVATION_MIN
        })
    })
    return [
        { id: `${nodeId}-mean`, data: mean, color: "rgb(98,218,170)" },
        { id: `${nodeId}-max`, data: max, color: "rgb(233,108,91" },
        { id: `${nodeId}-min`, data: min, color: "rgb(246,192,34)" }
    ]
    }catch(e){
    }
}