import { VisGraph, VisEdge} from './vis-graph.type'
import { NodeDef } from '../stage2/processed-graph'
import { stack } from 'd3'

const delEdges = (displayedEdges: VisEdge[], node: NodeDef) => {
    while (true) {
        const index = displayedEdges.findIndex((edge) => edge.source === node.id || edge.target === node.id)
        if (index === -1) {
            break
        }
        displayedEdges.splice(index, 1)
    }
}

const stacked = (vGraph: VisGraph) => {
    let displayedNodes = vGraph.visNodes
    let displayedEdges = vGraph.visEdges
    const rootNode = vGraph.rootNode
    const nodeMap = vGraph.nodeMap
    const noDisplayedNodes = []
    const keys = []
    let nodeTemp
    for (let nodeId of displayedNodes) {
        const node = nodeMap[nodeId]
        if (node.displayedName.indexOf('Mul') !== -1) {
            if (node.outputNode.size === 1) {
                const applyMomentumName = Array.from(node.outputNode)[0].match(/[1-9]\d{1,}/g)[0]
                const applyMomentumNode = nodeMap[applyMomentumName]
                const { id } = applyMomentumNode
                if (applyMomentumNode.inputNode.size === 5) {

                    if (!keys.includes('Mul')) {
                        nodeTemp = node
                        keys.push('Mul')
                        continue
                    }
                    delEdges(displayedEdges, node)
                    noDisplayedNodes.push(node.id)
                    const cst_mul = displayedNodes.find((n) => {
                        const last = n.lastIndexOf('_')
                        if (last !== -1) {
                            return n.substring(last + 1) === node.id
                        }
                    })
                    noDisplayedNodes.push(cst_mul)
                    noDisplayedNodes.push(id)

                    if (node.inputNode.size === 1) {

                        const addNName = Array.from(node.inputNode)[0].match(/[1-9]\d{1,}/g)[0]
                        const addNNode = nodeMap[addNName]
                        const addNParentName = Array.from(addNNode.inputNode)[0].match(/[1-9]\d{1,}/g)[0]
                        const addNParentNode = nodeMap[addNParentName]
                        delEdges(displayedEdges, addNNode)
                        noDisplayedNodes.push(addNNode.id)
                        if (addNNode.inputNode.size === 1 && addNParentNode.inputNode.size === 2) {
                            const makeTupleName = Array.from(addNNode.inputNode)[0].match(/[1-9]\d{1,}/g)[0]
                            const makeTupleNode = nodeMap[makeTupleName]
                            delEdges(displayedEdges, makeTupleNode)
                            noDisplayedNodes.push(makeTupleNode.id)

                            const mul1332Name = Array.from(makeTupleNode.inputNode).filter((input) => input.indexOf('Mul') === 0)[0].match(/[1-9]\d{1,}/g)[0]
                            const mul1332Node = nodeMap[mul1332Name]
                            delEdges(displayedEdges, mul1332Node)
                            noDisplayedNodes.push(mul1332Node.id)

                            const cst_muldepend = displayedNodes.find((n) => {
                                if (n.indexOf('cst') === 0) {
                                    const last = n.lastIndexOf('_')
                                    if (last !== -1) {
                                        return n.substring(last + 1) === mul1332Node.id
                                    }
                                }
                            })
                            noDisplayedNodes.push(cst_muldepend)

                            const featureName = Array.from(mul1332Node.inputNode)[0]
                            const featureNode = nodeMap[featureName]
                            if (featureNode) {
                                delEdges(displayedEdges, featureNode)
                                noDisplayedNodes.push(featureNode.id)
                            }
                        }
                    }

                    displayedEdges.push({ source: '224', target: '1330', count: 1})

                    const index1 = displayedEdges.findIndex((edge) => {
                        return edge.target === id && edge.source !== node.id && edge.source !== '222'
                    })
                    const edge1 = displayedEdges[index1]
                    const source1 = edge1.source
                    displayedEdges.splice(index1, 1)
                    noDisplayedNodes.push(source1)

                    const index2 = displayedEdges.findIndex((edge) => {
                        return edge.target === id && edge.source !== node.id && edge.source !== '222'
                    })
                    const edge2 = displayedEdges[index2]
                    const source2 = edge2.source
                    displayedEdges.splice(index2, 1)
                    noDisplayedNodes.push(source2)

                    const index3 = displayedEdges.findIndex((edge) => {
                        return edge.target === id && edge.source === node.id
                    })
                    displayedEdges.splice(index3, 1)

                    const index4 = displayedEdges.findIndex((edge) => {
                        return edge.target === id && edge.source !== node.id && edge.source === '222'
                    })
                    displayedEdges.splice(index4, 1)

                    const index5 = displayedEdges.findIndex((edge) => {
                        return edge.target === id && edge.source !== node.id && edge.source !== '222'
                    })
                    const edge5 = displayedEdges[index5]
                    const source5 = edge5.source
                    displayedEdges.splice(index5, 1)
                    noDisplayedNodes.push(source5)

                    const dependNode = nodeMap[Array.from(applyMomentumNode.outputNode)[0].match(/[1-9]\d{1,}/g)[0]]
                    delEdges(displayedEdges, dependNode)
                    noDisplayedNodes.push(dependNode.id)
                    const cst_depend = displayedNodes.find((n) => {
                        const last = n.lastIndexOf('_')
                        if (last !== -1) {
                            return n.substring(last + 1) === dependNode.id
                        }
                    })
                    noDisplayedNodes.push(cst_depend)

                    displayedNodes.forEach((node) => {
                        if (node.indexOf('feature') === 0) {
                            noDisplayedNodes.push(node)
                        }
                    })
                }
            }
            else if (node.outputNode.size === 2 && node.inputNode.size === 2) {
                if (!keys.includes('Mul')) {
                    nodeTemp = node
                    keys.push('Mul')
                    continue
                }
                delEdges(displayedEdges, node)
                noDisplayedNodes.push(node.id)
            }
        }
        if (node.displayedName.indexOf('make_tuple') !== -1) {
            if (node.inputNode.size === 3 && node.outputNode.size === 1) {
                if (!keys.includes('make_tuple')) {
                    nodeTemp = node
                    keys.push('make_tuple')
                    continue
                }
                const addNName = Array.from(node.outputNode)[0].match(/[1-9]\d{1,}/g)[0]
                const addNNode = nodeMap[addNName]
                delEdges(displayedEdges, node)
                delEdges(displayedEdges, addNNode)
                noDisplayedNodes.push(node.id)
                noDisplayedNodes.push(addNNode.id)
            }
        }
        if (node.displayedName.indexOf('MinimumGrad') !== -1) {
            const tuple_getitem = nodeMap[Array.from(node.outputNode)[0].match(/[1-9]\d{1,}/g)[0]]
            const MaximunGrad = nodeMap[Array.from(tuple_getitem.outputNode)[0].match(/[1-9]\d{1,}/g)[0]]
            if (node.inputNode.size === 2 && node.outputNode.size === 1 && tuple_getitem.outputNode.size === 1 && MaximunGrad.inputNode.size === 2) {

                if (!keys.includes('MinimumGrad')) {
                    nodeTemp = node
                    keys.push('MinimumGrad')
                    continue
                }
                //处理MinimumGrad节点
                delEdges(displayedEdges, node)
                noDisplayedNodes.push(node.id)
                const cst_minimumgrad = displayedNodes.find((n) => {
                    const last = n.lastIndexOf('_')
                    if (last !== -1) {
                        return n.substring(last + 1) === node.id
                    }
                })
                noDisplayedNodes.push(cst_minimumgrad)
                //处理tuple_getitem节点
                delEdges(displayedEdges, tuple_getitem)
                noDisplayedNodes.push(tuple_getitem.id)
                const cst_tuple = displayedNodes.find((n) => {
                    const last = n.lastIndexOf('_')
                    if (last !== -1) {
                        return n.substring(last + 1) === tuple_getitem.id
                    }
                })
                noDisplayedNodes.push(cst_tuple)
                //处理MaximumGrad
                delEdges(displayedEdges, MaximunGrad)
                noDisplayedNodes.push(MaximunGrad.id)
                const cst_maximun = displayedNodes.find((n) => {
                    const last = n.lastIndexOf('_')
                    if (last !== -1) {
                        return n.substring(last + 1) === MaximunGrad.id
                    }
                })
                noDisplayedNodes.push(cst_maximun)

                const tuple_getitem2 = nodeMap[Array.from(MaximunGrad.outputNode)[0].match(/[1-9]\d{1,}/g)[0]]
                delEdges(displayedEdges, tuple_getitem2)
                noDisplayedNodes.push(tuple_getitem2.id)
                const cst_tuple2 = displayedNodes.find((n) => {
                    const last = n.lastIndexOf('_')
                    if (last !== -1) {
                        return n.substring(last + 1) === tuple_getitem2.id
                    }
                })
                noDisplayedNodes.push(cst_tuple2)
            }
        }
        if (node.displayedName.indexOf('partial') === 0) {
            if (node.inputNode.size >= 1600) {
                let adam_vFlag = false
                let adam_mFlag = false
                let reshapeFlag = false
                let bertFlag = false
                displayedEdges = displayedEdges.filter((edge) => {
                    const { source, target } = edge
                    if (target === '9197') {
                        if (source.indexOf('adam_v') === 0) {
                            if (!adam_vFlag) {
                                return adam_vFlag = true
                            }
                            noDisplayedNodes.push(source)
                            return false
                        }
                        else if (source.indexOf('adam_m') === 0) {
                            if (!adam_mFlag) {
                                return adam_mFlag = true
                            }
                            noDisplayedNodes.push(source)
                            return false
                        }
                        else if (source.charAt(0) >= '0' && source.charAt(0) <= '9') {
                            if (!reshapeFlag) {
                                return reshapeFlag = true
                            }
                            noDisplayedNodes.push(source)
                            return false
                        }
                        else if (source.indexOf('bert') === 0) {
                            if (!bertFlag) {
                                return bertFlag = true
                            }
                            noDisplayedNodes.push(source)
                            return false
                        }
                        else {
                            return true
                        }
                    }
                    else {
                        return true
                    }
                })
            }
        }
    }

    displayedNodes = displayedNodes.filter((node) => {
        return noDisplayedNodes.indexOf(node) === -1
    })

    return {
        nodeMap,
        rootNode,
        visEdges: displayedEdges,
        visNodes: displayedNodes
    }
}

export default class VisGraphOptimizer {
    visGraphOptimizers = [];
    constructor() {
        this.visGraphOptimizers = [stacked]
    }
    optimize(vGraph: VisGraph) {
        this.visGraphOptimizers.forEach((optimizer) => {
            vGraph = optimizer(vGraph)
        })
        return vGraph
    }
}

