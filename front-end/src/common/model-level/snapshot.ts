import { fetchModelScalars } from '../../api/modelLevel'

export const fetchAndComputeModelScalars = async (graph_name: string, start_step: number, end_step: number, modelLevelcolorMap) => {
    let data = await fetchModelScalars({ graph_name: graph_name, start_step: start_step, end_step: end_step });
    let trainLoss = [],
        testLoss = [],
        trainAccuracy = [],
        testAccuracy = [],
        learningRate = [];

    data.data.data.map(d => {
        trainLoss.push({
            x: d.step,
            y: d.train_loss
        })
        testLoss.push({
            x: d.step,
            y: d.test_loss
        })
        trainAccuracy.push({
            x: d.step,
            y: d.train_accuracy
        })
        testAccuracy.push({
            x: d.step,
            y: d.test_accuracy
        })
        learningRate.push({
            x: d.step,
            y: d.learning_rate
        })

    })

    return [
        { id: `train_loss`, data: trainLoss, color: modelLevelcolorMap.get("train_loss") },
        { id: `test_loss`, data: testLoss, color: modelLevelcolorMap.get("test_loss") },
        { id: `train_accuracy`, data: trainAccuracy, color: modelLevelcolorMap.get("train_accuracy") },
        { id: `test_accuracy`, data: testAccuracy, color: modelLevelcolorMap.get("test_accuracy") },
        { id: `learning_rate`, data: learningRate, color: modelLevelcolorMap.get("learning_rate") },
    ]
}
