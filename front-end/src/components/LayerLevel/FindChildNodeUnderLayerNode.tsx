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
    let res = [], queue = [];
    queue.push(root);
    while (queue.length !== 0) {
      let node = queue.shift();
      if (node instanceof OperationNodeImp) {
        (node as OperationNodeImp).outputNode.forEach((outputNodeId) => {
          // outputNodeId 一定是一个 operation Node
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
    return res;
  }
};