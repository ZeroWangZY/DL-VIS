import {
  NodeType,
  GroupNode,
  LayerNode,
  DataType,
  OperationNode,
  GroupNodeImp,
  OperationNodeImp,
  DataNodeImp,
  LayerNodeImp,
} from "../../common/graph-processing/stage2/processed-graph";

export const FindChildNodeUnderLayerNode = (nodeMap, NodeId: string) => {
  // 超出layer node下面的一个 output node在layer node之外的节点。
  // 如果这个output node是一个group node， 则继续向里面寻找
  let scope = (nodeMap[NodeId] as LayerNodeImp).id;
  let currentNode = nodeMap[NodeId]; // currentNode一定是一个layer node
  return BFS(currentNode);

  function BFS(root) {
    if (root === null) return;
    let operationNodeOutGegreeMap = new Map();

    let res = [], queue = [];
    queue.push(root);
    while (queue.length !== 0) {
      let node = queue.shift();
      if (node instanceof OperationNodeImp) {
        if (!operationNodeOutGegreeMap.has(node.id))
          operationNodeOutGegreeMap.set(node.id, 0);
        (node as OperationNodeImp).outputNode.forEach((outputNodeId) => {
          // outputNodeId 一定是一个 operation Node
          operationNodeOutGegreeMap.set(node.id, operationNodeOutGegreeMap.get(node.id) + 1);
          let scopeOfOutputNode = (nodeMap[outputNodeId] as OperationNodeImp).parent;
          // 判断scope2是否在scope1同级或者下面
          // 也就是判断scope2是否以scope1开头
          if (!scopeOfOutputNode.startsWith(scope))
            res.push((node as OperationNodeImp).id);
        })
      } else if (node instanceof GroupNodeImp || node instanceof LayerNodeImp) {
        (node as GroupNodeImp).children.forEach((nodeId) => {
          queue.push(nodeMap[nodeId]);
        })
      }
    }
    if (res.length === 0) {
      for (var [operationNodeId, degree] of operationNodeOutGegreeMap) {
        if (degree === 0)
          res.push(operationNodeId);
      }
    }
    return res;
  }
};