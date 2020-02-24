export function clearThree(obj){
    while(obj.children.length > 0){ 
      obj.remove(obj.children[0]);
    }
    if(obj.geometry) obj.geometry.dispose()
  
    if(obj.material){ 
      //in case of map, bumpMap, normalMap, envMap ...
      Object.keys(obj.material).forEach(prop => {
        if(!obj.material[prop])
          return         
        if(typeof obj.material[prop].dispose === 'function')                                  
          obj.material[prop].dispose()                                                        
      })
      obj.material.dispose()
    }
}  

export function coordinateTransform(renderData, clientHeight){
    let dispalyedEdges = renderData.dispalyedEdges.map((link) => {
        let points = []
        points = link.points.map(point => {
            return {
                x: point.x,
                y: clientHeight - point.y 
            }
        });
        return {
            points,
            source: link.source,
            target: link.target,
            label: link.label
        }
    })
    let displayedNodes = renderData.displayedNodes.map((node) => 
    {
        return {
            nodeId: node.nodeId,
            point: { 
                x: node.point.x,
                y: clientHeight - node.point.y 
            },
            size: node.size
        }
    })
    return {
        dispalyedEdges,
        displayedNodes
    }
}