//聚合为层级数据
const NAMESPACE_DELIM = '/';
// class Hierarchy {
    
// }
function getStrictName(name){
    let parts = name.split(NAMESPACE_DELIM);
    return name + NAMESPACE_DELIM + '(' + parts[parts.length - 1] + ')';
}

function startsWith(string, target, position) {
    const { length } = string
    position = position == null ? 0 : position
    if (position < 0) {
      position = 0
    }
    else if (position > length) {
      position = length
    }
    target = `${target}`
    return string.slice(position, position + target.length) == target
}

// function fomatNode(hierarchy, nodeOpMap){
//   let nodes = [];
//  // if(hierarchy.nodes&&hierarchy.links){
//     for(let node in hierarchy.nodes){
//       if(JSON.stringify(nodes[node]) !== '{}'){
//         nodes.push({
//           id: node,
//           group: nodeOpMap[node],
//           child: fomatNode(hierarchy.nodes[node], nodeOpMap)
//         })
//        // hierarchy.nodes[node] = fomatNode(hierarchy.nodes[node], nodeOpMap)
//       }else{
//         nodes.push({
//           id: node,
//           group: nodeOpMap[node]
//         })
//       }
//     }
//     hierarchy.nodes = nodes
//  // }
//   // for(let node in hierarchy){
//   //   nodes.push({
//   //     id: node,
//   //     group: nodeOpMap[node]
//   //   })
//   // }
//   return nodes
// }

function getHierarchicalPath(name){
    let path = [];
    let i = name.indexOf(NAMESPACE_DELIM);
    while (i >= 0) {
      path.push(name.substring(0, i));
      i = name.indexOf(NAMESPACE_DELIM, i + 1);
    }
    path.push(name);
    return path;
  };
function mapStrictHierarchy(nodeNames) {
    /** Dictionary that maps the old new to the new name */
    let newNameDictionary = {};
    let namespaceSet = {};
    nodeNames.sort();
    for (let i = 0; i < nodeNames.length - 1; ++i) {
      let a = nodeNames[i];
      getHierarchicalPath(a).slice(0, -1).map(ns => {
        namespaceSet[ns] = true;
      });
      for (let j = i + 1; j < nodeNames.length; ++j) {
        let b = nodeNames[j];
        if (startsWith(b, a)) {
          if (b.length > a.length && b.charAt(a.length) === NAMESPACE_DELIM) {
            newNameDictionary[a] = getStrictName(a);
            break;
          }
        } else {
          break;
        }
      }
    }
    return newNameDictionary;
};
function hierarchyNode(graph){
    let nodes = graph.nodes
    graph.depth = 0
    let nodeMap = {}
    // let nodeNames = nodes.map(d=>d.id)
    // let nodeNamesDict = mapStrictHierarchy(nodeNames)
    
    for(let node of nodes){
  //      node.id = nodeNamesDict[node.id] || node.id;
        let path = node.id.split('/')
        graph.depth = Math.max(path.length, graph.depth)
        let parent = nodeMap
        for (let i = 0; i < path.length; i++) {
            if(!parent.hasOwnProperty(path[i])) {
                parent[path[i]] = {}
            }
            parent = parent[path[i]]
        }
    }
    graph.hierarchyNode = nodeMap
    return graph
}
function hierarchyEdge(graph){
    let links = graph.links
    let hierarchyNode = graph.hierarchyNode
    let hierarchy = {}
    let test = []
    if(JSON.stringify(hierarchyNode) !== '{}'){
      let path = ''
      hierarchy = classfyEdge(hierarchyNode,graph.nodeOpMap,links,path)
    }
    //由map形式整理为数组
  //  console.log(fomatNode(hierarchy,graph.nodeOpMap))
    

    graph.hierarchy = hierarchy
}
function classfyEdge(nodes,nodeOpMap,links,path){
  let hierarchyEdgeMap = {}
  let hierarchyEdge = []
  let hierarchyNode = []
  for(let node in nodes){
    if(JSON.stringify(nodes[node]) !== '{}'){
      hierarchyNode.push({
        id: node,
        child: classfyEdge(nodes[node],nodeOpMap,links,`${path}${node}/`)
      })
     // nodes[node] = classfyEdge(nodes[node],links,`${path}${node}/`)
    }else{
      hierarchyNode.push({
        id: node,
        group: nodeOpMap[`${path}${node}`]
      })
    }
  }

  for(let link of links){
   //   let indexS = link.source.startsWith(path);  
     
    //  link.source  = link.source.substring(0, indexS+1);

 //     let indexT = link.target.startsWith(path);  

      let source = link.source.replace(path, "").split('/')[0];
      let target = link.target.replace(path, "").split('/')[0];
  //    link.target  = link.target.substring(0, indexT+1);

      if(link.source.startsWith(path)&&link.target.startsWith(path)&&nodes.hasOwnProperty(source)&&nodes.hasOwnProperty(target)&&source!==target){
        hierarchyEdgeMap[source] = target
      }
  }
  for(let link in hierarchyEdgeMap){
    hierarchyEdge.push({
      source: link,
      target: hierarchyEdgeMap[link]
    })
  }
  return {
    nodes: hierarchyNode,
    links: hierarchyEdge
  }
}
function hierarchyBuild(graph){
  //层级名相同的修改name
  let nodes = graph.nodes
  let nodeNames = nodes.map(d=>d.id)
  let nodeNamesDict = mapStrictHierarchy(nodeNames)
  let nodeOpMap = {}
 // 
  let links = graph.links
  for(let node of nodes){
    node.id = nodeNamesDict[node.id] || node.id;
    nodeOpMap[node.id] = node.group
  }
  graph.nodeOpMap = nodeOpMap
  for(let link of links){
    link.source = nodeNamesDict[link.source] || link.source;
    link.target = nodeNamesDict[link.target] || link.target;
  }
 // bulidNodeOpMap(graph)
  hierarchyNode(graph)
 // console.log(graph)
  hierarchyEdge(graph)
  //return nodes
  return graph.hierarchy
}



// fetchAndParseGraphData('./pbtxtdata/test-graph-1.pbtxt').then(pbtxtData => {
//     let graph = buildGraph(pbtxtData);
//     let hierarchy = hierarchyBuild(graph)
//     console.log(hierarchy)
// })