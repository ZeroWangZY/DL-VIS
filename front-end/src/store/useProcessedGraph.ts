import { useState, useEffect } from 'react'
import { ProcessedGraph, ProcessedGraphImp, OptionsDef, ModificationType, GroupNode, LayerNode, LayerNodeImp, GroupNodeImp } from '../common/graph-processing/stage2/processed-graph'

let listeners = []
let processedGraph: ProcessedGraph = new ProcessedGraphImp()
// 广播变化, 让使用了该hook的组件重新渲染
export const broadcastGraphChange = () => {
  processedGraph = Object.assign(new ProcessedGraphImp(), processedGraph)
  listeners.forEach(listener => {
    listener(processedGraph)
  });
}

export const setProcessedGraph = (newProcessedGraph: ProcessedGraph) => {
  processedGraph = newProcessedGraph
  broadcastGraphChange()
}

export const modifyProcessedGraph = (operation: ModificationType, opts: OptionsDef) => {
  let parentNode, nodeId, modifyOptions;
  switch (operation) {
    case ModificationType.MODIFY_NODE_ATTR:
      nodeId = opts.nodeId;
      modifyOptions = opts.modifyOptions;
      let node = processedGraph.nodeMap[nodeId] as GroupNode;
      for (let option in modifyOptions) {
        node[option] = modifyOptions[option];
      }
      break;
    case ModificationType.MODIFY_NODE_TYPE:
      nodeId = opts.nodeId;
      modifyOptions = opts.modifyOptions;
      let newNode;
      if ("layerType" in modifyOptions) {
        newNode = new LayerNodeImp(modifyOptions);
      } else {
        newNode = new GroupNodeImp(modifyOptions);
      }
      processedGraph.nodeMap[nodeId] = newNode;
      break;
    case ModificationType.NEW_NODE:
      const { newNodeIdInfo } = opts;
      const { id, children, parent } = newNodeIdInfo;
      // 通过聚合得到的新节点
      let newGroupNode = new GroupNodeImp({
        id,
        children,
        parent
      });
      // 添加新节点
      processedGraph.nodeMap[id] = newGroupNode;
      // 更新父节点的孩子
      parentNode = (parent === "___root___") ? processedGraph.rootNode : processedGraph.nodeMap[parent];
      parentNode = parentNode as GroupNode | LayerNode;
      parentNode.children.add(id);
      for (let childId of children) {
        parentNode.children.delete(childId);
        processedGraph.nodeMap[childId].parent = id;// 更新所有选中节点的parent
      }
      break;
    case ModificationType.DELETE_NODE:
      nodeId = opts.nodeId;
      let nodeToDelete = processedGraph.nodeMap[nodeId] as GroupNode | LayerNode;// 要删除的节点

      let parentNodeId = nodeToDelete.parent;
      parentNode = (parentNodeId === "___root___") ? processedGraph.rootNode : processedGraph.nodeMap[parentNodeId];
      // 更新该节点的parent的children
      (parentNode as GroupNode | LayerNode).children.delete(nodeId);
      // 更新该节点的children的parent
      let childrenIdSet = nodeToDelete.children;
      childrenIdSet.forEach(childId => {
        processedGraph.nodeMap[childId].parent = parentNodeId;
        (parentNode as GroupNode | LayerNode).children.add(childId);
      })
      // 删除该节点
      delete processedGraph.nodeMap[nodeId];
      break;
    default:
      break;
  }
  broadcastGraphChange()
}

export const useProcessedGraph = () => {
  const [graph, newListener] = useState(processedGraph)

  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return graph
}
