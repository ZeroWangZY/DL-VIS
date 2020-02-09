
let isLabelDisplay = false;// 默认不显示label
let isArrowDisplay = false;// 默认不显示箭头
let distance = 30;
let checkedOpPreserved = [];
let nodesAfterFiltering, linksAfterFiltering; // filter之后的nodes 和 Links

let color = d3.scaleOrdinal(d3.schemeCategory20); // 节点颜色 根据group区分

// svg 初始化
let svgWidth = d3.select('#svg-container').node().clientWidth;
let svgHeight = d3.select('#svg-container').node().clientHeight;
let svg = d3.select('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

svg.selectAll('.g-main').remove();

let gMain = svg.append('g')
    .classed('g-main', true);

// 点击空白处取消选择
let rect = gMain.append('rect')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .style('fill', 'white')
rect.on('click', () => {
    node.each(function(d) {
        d.selected = false;
        d.previouslySelected = false;
    });
    node.classed("selected", false);
});


let gDraw = gMain.append('g'); //包括nodes links labels

// 刷选
let brushMode = false;
let brushing = false;
let gBrushHolder = gDraw.append('g');
let gBrush;
let brush;

let linkG = gDraw.append("g").attr("class", "link")//svg.selectAll(".link"),
    nodeG = gDraw.append("g").attr("class", "node"),
    labelG = gDraw.append("g").attr("class", "label");

let link = linkG.selectAll("line"), node= nodeG.selectAll("circle"), labelText = labelG.selectAll("text");
// 绑定zoom事件
let zoom = d3.zoom()
    .on('zoom', zoomed)
gMain.call(zoom);
// gMain.on("dblclick.zoom", null);

function zoomed() {
    gDraw.attr('transform', d3.event.transform);
}

let simulation;
    
// tooltip
let tooltip = svg.append("g")
    .attr("id", "node-tooltip")
    .attr("visibility", "hidden");
let tooltipRect = tooltip.append("rect")
    .attr("fill", "#333")
    .attr("height", "4em");
let circlePos = ["1em", "3em"]
tooltip.selectAll("circle")
    .data(circlePos)
    .enter()
    .append("circle")
    .attr("fill", "#676666")
    .attr("r", 3)
    .attr("cx", "1em")
    .attr("cy", d=>d)
let tooltipName = tooltip.append("text")
    .attr("x", "1.5em")
    .attr("y", "1em");
let tooltipGroup = tooltip.append("text")
    .attr("x", "1.5em")
    .attr("y", "3em");
    
// hint 只加载一次
let hints = ['Use the scroll wheel to zoom',
    'Hold the shift key to select nodes'];
let gHint = svg.append('g')
    .classed('hint', true);
    gHint.append('rect')
    .attr('width', 245)
    .attr('height', 40)
    .attr('stroke', '#333')
    .attr('fill', '#eee')
    .attr('stroke-dasharray', '7 7')
    .attr('x', svgWidth)
    .attr('y', svgHeight)
    .attr('transform','translate(-255, -50)')
gHint.selectAll('text')
    .data(hints)
    .enter()
    .append('text')
    .attr('x', svgWidth - 20)
    .attr('y', function(d,i) { return svgHeight - 35 + i * 18; })
    .text(function(d) { return d; });

// 绑定shift键事件
let shiftKey;
d3.select('body').on('keydown', keydown);
d3.select('body').on('keyup', keyup);

// 每次更新图时调用
function drawGraph(graph, dist, checkedOp, init = false) {
    if (! ("links" in graph)) {
        console.log("links are missing");
        return;
    }
    distance = dist;
    checkedOpPreserved = checkedOp;
    // 根据选择的op过滤graph
    // let graphAfterFiltering = {...graph};
    nodesAfterFiltering = graph.nodes.filter(node => checkedOp.indexOf(node.group)!==-1);
    let nodesName = nodesAfterFiltering.map(d=>d.id);
    linksAfterFiltering = graph.links.filter(link => {
        if(typeof(link.source) === "object") {
            return nodesName.indexOf(link.source.id)!==-1 && nodesName.indexOf(link.target.id)!==-1
        } else {
            return nodesName.indexOf(link.source)!==-1 && nodesName.indexOf(link.target)!==-1
        }
    });
    console.log(nodesAfterFiltering, linksAfterFiltering)
    let nodes = {};

    for (let i = 0; i < nodesAfterFiltering.length; i++) {
        // nodes[nodesAfterFiltering[i].id] = nodesAfterFiltering[i];
        // graph.nodes[i].weight = 1.01;
        // 试了下椭圆
        nodesAfterFiltering[i].rx = nodesAfterFiltering[i].id.length * 4.5; 
        nodesAfterFiltering[i].ry = 12;
    }

    brushMode = false;
    brushing = false;
    gBrush = null;
    brush = d3.brush()
        .on("start", brushstart)
        .on("brush", brushed)
        .on("end", brushend);

    linkG.selectAll("line").remove();
    nodeG.selectAll("circle").remove();
    labelG.selectAll("text").remove();

    // append边和节点
    link = linkG.selectAll("line")
        .data(linksAfterFiltering)
        .enter()
        .append("line")
        .attr('marker-end', isArrowDisplay?'url(#arrow)':'none')
        .attr("stroke-width", function(d) { return ('value' in d) ? Math.sqrt(d.value) : '1.5px'; });
    node = nodeG.selectAll("circle")
        .data(nodesAfterFiltering)
        .enter()
        .append("circle")
        .attr("r", (d) => ('child' in d) ? 8 : 5)
        // .selectAll("ellipse")
        // .data(graph.nodes)
        // .enter().append("ellipse")  
        // .attr("rx", function(d) { return d.rx; })
        // .attr("ry", function(d) { return d.ry; })
        .attr("fill", (d) => ('child' in d) ? 'url(#person)' :  color(d.group))
        .attr("stroke", (d) => ('child' in d) ? 'node' : "#eee")
        .call(d3.drag()
                .on("start", dragstart)
                .on("drag", dragged)
                .on("end", dragend)
        )
        .on("mouseover", onMousehover)
        .on("mouseout", onMouseout)
        .on("mousedown", onNodeClick) //右键关闭
        .on("click", onNodeClick); // 

    labelText = labelG.selectAll("text")
        .data(nodesAfterFiltering)
        .enter()
        .append("text")  
        .attr("dy", 2)
        .text(function(d) {return ('fullId' in d) ? d.fullId : d.id})// label层级关系也要显示
        .attr("fill", "#c0c0c0")
        .attr('display', isLabelDisplay?'block':'none');

    let forceCollide = d3.forceCollide()
        .radius(10)
        .strength(0.95);

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink()
            .id(function(d) { return d.id; })
            .distance(function(d) { 
                return distance;
            })
        )
        .force("collide", forceCollide)// d3.ellipseForce(6, 0.5, 5))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(svgWidth/2, svgHeight/2))
        .force("x", d3.forceX(svgWidth/2))
        .force("y", d3.forceY(svgHeight/2))
        // .on("tick", ticked);
    simulation
        .nodes(nodesAfterFiltering)
        .on("tick", ticked);
    simulation.force("link")
        .links(linksAfterFiltering);
    
};

function updateGraph () {
    
}

function onNodeClick (d) {
    // 判断鼠标左击还是右击
    // 左击 打开 右击 收起
    if (d3.event.button === 0) {
        if (("child" in d) && !d.open) {
            d.open = true;
            // 点击的可以展开的节点一定是最外层 找到它
            let clickIndex = nodesAfterFiltering.indexOf(d);
            // 把父节点的名字存到子节点中
            let childNodes = d.child.nodes.map(childnode=>{return {...childnode, 'fullId': d.id + "/" + childnode.id, 'parent': d.id}});
            nodesAfterFiltering.splice(clickIndex, 1);// 删除点击的父节点
            let newNodes = nodesAfterFiltering.concat(childNodes); // 添加展开的新节点
            console.log(childNodes, newNodes);
    
            // 删除点击的node的相关连线
            let tempLinks = linksAfterFiltering.filter(link => {
                return link.source.index !== d.index && link.target.index !== d.index; // 用index 因为id有重复
            });
            // console.log("父节点相关连线：" + tempLinks);
            let newLinks = tempLinks.concat(d.child.links); // 添加新边
            // console.log(newLinks);
            let newGraph = {
                "nodes": newNodes,
                "links": newLinks
            }
            drawGraph(newGraph, distance, checkedOpPreserved);
        }
    } else if (d3.event.button === 0) {
        // if (("child" in d) && d.open) {
        //     d.open = false;
        //     console.log("close");
        //     // 删除child
        //     let newNodes = nodesAfterFiltering.filter(i => !d.child.nodes.includes(i));
        //     let newLinks = linksAfterFiltering.filter(i => !d.child.links.includes(i));
        //     // 添加父节点
        //     console.log(nodesAfterFiltering,linksAfterFiltering, newNodes, newLinks);
        //     let newGraph = {
        //         "nodes": newNodes,
        //         "links": newLinks
        //     }
        //     drawGraph(newGraph, distance, checkedOpPreserved);
        // }
    }
}


// tooltip的显隐
function onMousehover (d) {
    tooltip.attr("visibility", "visible")
        .attr("transform", "translate(" + d3.event.offsetX + "," + d3.event.offsetY + ")");
    let name = "Id: " + d.id;
    let group = "Op: " + d.group;
    // 计算宽度
    tooltipName.text(name);
    tooltipGroup.text(group);
    let rectWidth =  d3.max([d3.select(tooltipName)._groups[0][0]._groups[0][0].getBoundingClientRect().width,
        d3.select(tooltipGroup)._groups[0][0]._groups[0][0].getBoundingClientRect().width]) + 25;
    tooltipRect.attr("width", rectWidth + "px");
}

function onMouseout () {
    tooltip.attr("visibility", "hidden");
}

// 刷选事件
function brushstart() {
    brushing = true;
    tooltip.attr("visibility", "hidden");
    node.each(function(d) { 
        d.previouslySelected = shiftKey && d.selected; 
    });
}

function brushed() {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;
    tooltip.attr("visibility", "hidden");

    let extent = d3.event.selection;

    node.classed("selected", function(d) {
        return d.selected = d.previouslySelected ^
        (extent[0][0] <= d.x && d.x < extent[1][0]
         && extent[0][1] <= d.y && d.y < extent[1][1]);
    });
}

function brushend() {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;
    if (!gBrush) return;

    gBrush.call(brush.move, null);

    if (!brushMode) {
        gBrush.remove();
        gBrush = null;
    }

    brushing = false;
}

// node的拖拽事件
function dragstart(d) {
    tooltip.attr("visibility", "hidden");
    if (!d3.event.active) simulation.alphaTarget(0.9).restart();
    if (!d.selected && !shiftKey) {
        node.classed("selected", function(p) { return p.selected =  p.previouslySelected = false; });
    }
    d3.select(this).classed("selected", function(p) { d.previouslySelected = d.selected; return d.selected = true; });
    node.filter(function(d) { return d.selected; })
        .each(function(d) {
            d.fx = d.x;
            d.fy = d.y;
        })
}

function dragged(d) {
    tooltip.attr("visibility", "hidden");
    node.filter(function(d) { return d.selected; })
        .each(function(d) { 
            d.fx += d3.event.dx;
            d.fy += d3.event.dy;
        })
}

function dragend(d) {
    if (!d3.event.active)
    simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
    node.filter(function(d) { return d.selected; })
        .each(function(d) {
            d.fx = null;
            d.fy = null;
        })
}

// 控制label显隐
function changeLabelDisplay () {
    isLabelDisplay = !isLabelDisplay;
    labelText.attr('display',function(d) {return isLabelDisplay?'block':'none'});
}

// 控制箭头显隐
function changeArrowDisplay () {
    isArrowDisplay = !isArrowDisplay;
    link.attr('marker-end', function(d) {return isArrowDisplay?'url(#arrow)':'none'});
}

// shift按键事件
function keydown() {
    shiftKey = d3.event.shiftKey;
    if (shiftKey) {
        if (gBrush)
            return;
        brushMode = true;
        if (!gBrush) {
            gBrush = gBrushHolder.append('g');
            gBrush.call(brush);
        }
    }
}

function keyup() {
    shiftKey = false;
    brushMode = false;
    if (!gBrush)
        return;
    if (!brushing) {
        gBrush.remove();
        gBrush = null;
    }
}

function ticked() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    labelText.attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr('text-anchor', function(d) { return d.x < svgWidth/2 ? 'end':'start'})
        .attr("dx", function(d) { return d.x < svgWidth/2 ? -5 : 5});
}
document.oncontextmenu = function(e){
    e.preventDefault();
};
