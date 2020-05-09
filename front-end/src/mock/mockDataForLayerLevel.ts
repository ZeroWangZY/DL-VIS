import { ActivationsData } from '../types/layerLevel'

function randData(){
    let activations = []
    let sign = []
    for(let i=0;i < 32;i ++){
        for(let j=0;j < 10;j ++){ 
            sign.push(Math.random()*10)
        }
        activations.push(sign)
        sign = []
    }
    return activations
}
export const activationsData =() => {
    return {
        data:{
        activations: randData(),
        data_index: []
      }
    }
}