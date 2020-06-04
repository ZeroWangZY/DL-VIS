import { ProcessedGraph, GroupNode } from "./processed-graph";

const aggreOptimization = (hGraph: ProcessedGraph): void => {//更改无意义边跨越节点的命名空间以简化视图
  //寻找
  //1:过滤出所有没有children的节点
  const noChildNodes = [];
  for (let key in hGraph.nodeMap) {
    if (!(hGraph.nodeMap[key] as GroupNode).children) {
      noChildNodes.push(hGraph.nodeMap[key]);
    }
  }

  //2:通过边找到上述每个节点相关的节点
  noChildNodes.forEach((node) => {
    const relatedNodes = [];
    for (let edge of hGraph.rawEdges) {
      if (edge.source == node.id) {
        relatedNodes.push(edge.target);
      } else if (edge.target == node.id) {
        relatedNodes.push(edge.source)
      }
    }

    //3.找到目标命名空间
    const depth = [];
    const relatedNamespace = [];
    if (relatedNodes.length < 1) {//只处理连接至n个或者n个以上节点的节点(n对应左测数字)
      return;
    } else {
      for (let node of relatedNodes) {
        relatedNamespace.push(node.split("/"));
        depth.push(node.split("/").length);
      }

    }
    let targetNode = "";
    const minDepth = Math.min(...depth);
    if (node.id.split("/").length - 1 >= minDepth - 1) {//目标节点深度要大于自身
      return;
    } else {
      findTN: for (let i = 0; i < minDepth; i++) {
        let tempNamespace = "";
        for (let j = 0; j < relatedNodes.length; j++) {
          if (tempNamespace == "") {
            tempNamespace = relatedNamespace[j][i];
          } else {
            if (relatedNamespace[j][i] != tempNamespace) {
              break findTN;
            }
          }
        }
        targetNode = targetNode + tempNamespace + "/";
      }
    }
    if (targetNode == "") { return; };
    targetNode = targetNode.substring(0, targetNode.length - 1);//去掉最后的斜杠

    //修改
    //1:节点当前所在父节点的children中移除该节点
    if (node.parent == "___root___") {
      if (hGraph.rootNode.children) {
        hGraph.rootNode.children.delete(node.id);
      }
    } else {
      if ((hGraph.nodeMap[node.parent] as GroupNode).children) {
        (hGraph.nodeMap[node.parent] as GroupNode).children.delete(node.id);
      }
    }
    //2:目标节点的children中添加该节点
    if (relatedNodes.length == 1) {//处理只与一个节点连接的情况
      targetNode = targetNode.substring(0, targetNode.lastIndexOf("/"));
    }
    (hGraph.nodeMap[targetNode] as GroupNode).children.add(node.id);
    //3:修改节点parent为目标节点
    node.parent = targetNode;
  });
}

export default class ProcessedGraphOptimizer {
  processedGraphOptimizers = [];

  constructor() {
    this.processedGraphOptimizers = [
      aggreOptimization
    ];
  }

  optimize(hGraph: ProcessedGraph) {
    this.processedGraphOptimizers.forEach((optimizer) => {
      optimizer(hGraph);
    });
  }
}