import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import "./NodeInfoCard.css";
import { useProcessedGraph } from "../../store/processedGraph";
import {
  NodeType,
  GroupNode,
  DataType,
  OperationNode,
  GroupNodeImp,
  OperationNodeImp,
  DataNodeImp,
} from "../../common/graph-processing/stage2/processed-graph";
import { StackedOpNodeImp } from "../../common/graph-processing/stage3/vis-graph.type"
import { useVisGraph } from "../../store/visGraph";

const useStyles = makeStyles({
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
  },
  content: {
    fontSize: 16,
    // marginBottom: 10,
    textAlign: "left",
  },
});

const NodeInfoCard: React.FC<{ selectedNodeId: string | null }> = (props: {
  selectedNodeId;
}) => {
  const { selectedNodeId } = props;
  const visGraph = useVisGraph();
  const processedGraph = useProcessedGraph();
  const classes = useStyles();
  if (!selectedNodeId || !visGraph || !visGraph.visNodeMap || !processedGraph || !processedGraph.nodeMap)
    return (<div></div>);

  const { nodeMap } = processedGraph;
  const { visNodeMap } = visGraph;

  let selectedNode = null; // selectedNodes包含所有选中节点
  let isStackedNode = false;
  if (visNodeMap[selectedNodeId] instanceof StackedOpNodeImp) { // 选中堆叠子图
    isStackedNode = true;
    selectedNode = visNodeMap[selectedNodeId];
  } else if (selectedNodeId !== null) { // 传入的参数是string
    selectedNode = nodeMap[selectedNodeId];
  }

  const getDisplayedName = (nodeId) => {
    if (isStackedNode) return visNodeMap[nodeId].displayedName;
    return nodeMap[nodeId].displayedName;
  };

  const getContents = (selectedNode): any[] => { // 如果选中多个节点，则将每个节点信息依次展示
    let contents = [];
    if (selectedNode === undefined || selectedNode === null) return [];

    let parameters = [], constVals = [];
    if (selectedNode.type === NodeType.OPERTATION) {
      (selectedNode as OperationNodeImp).auxiliary.forEach((id) => {
        if ((nodeMap[id] as DataNodeImp).dataType === DataType.PARAMETER)
          parameters.push((nodeMap[id] as DataNodeImp).id);
        else if ((nodeMap[id] as DataNodeImp).dataType === DataType.CONST)
          constVals.push((nodeMap[id] as DataNodeImp).id);
      })
    }

    contents.push(
      <CardContent style={{ padding: 0 }} key={selectedNode.displayedName}>
        <Typography
          className={classes.title}
          style={{
            backgroundColor: "RGB(233,233,233)",
          }}
        >
          {(selectedNode.displayedName as string).length <= 25
            ? selectedNode.displayedName
            : selectedNode.displayedName.slice(0, 25) + "..."}
        </Typography>
        {selectedNode.type === NodeType.GROUP ||
          (selectedNode.type === NodeType.LAYER && (
            <>
              <Typography
                className={classes.content}
                style={{
                  backgroundColor: "RGB(233,233,233)",
                }}
              >
                {"Children: " +
                  `${(selectedNode as GroupNode).operationChildrenCount}` +
                  " nodes"}
              </Typography>
              <Typography
                className={classes.content}
                style={{
                  marginBottom: 10,
                  backgroundColor: "RGB(233,233,233)",
                }}
              >
                {"Subgraph: " +
                  `${(selectedNode as GroupNode).leafOperationNodeCount}` +
                  " nodes"}
              </Typography>
            </>
          ))}
        <Typography className={classes.title}>
          {"Inputs: (" + `${selectedNode.inputNode.size}` + ")"}
        </Typography>
        {Array.from(selectedNode.inputNode).map((d, i) => (
          <Typography className={classes.content} key={"inputNode" + i}>
            {getDisplayedName(d).length <= 25
              ? getDisplayedName(d)
              : getDisplayedName(d).slice(0, 25) + "..."}
          </Typography>
        ))}

        <Typography className={classes.title}>
          {"Outputs: (" + `${selectedNode.outputNode.size}` + ")"}
        </Typography>
        {Array.from(selectedNode.outputNode).map((d, i) => (
          <Typography className={classes.content} key={"outputNode" + i}>
            {getDisplayedName(d).length <= 25
              ? getDisplayedName(d)
              : getDisplayedName(d).slice(0, 25) + "..."}
          </Typography>
        ))}

        {selectedNode.type === NodeType.OPERTATION && (
          <>
            <Typography className={classes.title}>
              {"Attribute: (" +
                `${(selectedNode as OperationNode).attributes.length}` +
                ")"}
            </Typography>
            {(selectedNode as OperationNode).attributes.map((
              d,
              i // d:[name: "xx",value: "xx"]
            ) => (
                <div className={"Grid"}>
                  <div className={"Grid-cell"}>
                    <text>
                      {(d.name as string).length <= 15
                        ? d.name
                        : d.name.slice(0, 15) + "..."}
                    </text>
                  </div>
                  <div className={"Grid-cell"}>
                    <text>{d.value}</text>
                  </div>
                </div>
              ))}
            <Typography className={classes.title}>
              {"Const: (" + `${constVals.length}` + ")"}
            </Typography>
            {constVals.map((d, i) => (
              <Typography className={classes.content} key={"constNode" + i}>
                {getDisplayedName(d).length <= 25
                  ? getDisplayedName(d)
                  : getDisplayedName(d).slice(0, 25) + "..."}
              </Typography>
            ))}

            <Typography className={classes.title}>
              {"Parameters: (" + `${parameters.length}` + ")"}
            </Typography>
            {parameters.map((d, i) => (
              <Typography className={classes.content} key={"parameterNode" + i}>
                {getDisplayedName(d).length <= 25
                  ? getDisplayedName(d)
                  : getDisplayedName(d).slice(0, 25) + "..."}
              </Typography>
            ))}
          </>
        )}
      </CardContent>
    )
    return contents;
  }

  const getStackedNodeContents = (selectedNode): any[] => {
    let contents = [];
    if (selectedNode === undefined || selectedNode === null) return [];

    contents.push(
      <CardContent style={{ padding: 0 }} key={selectedNode.displayedName}>
        <Typography
          className={classes.title}
          style={{
            backgroundColor: "RGB(233,233,233)",
          }}
        >
          {(selectedNode.displayedName as string).length <= 25
            ? selectedNode.displayedName
            : selectedNode.displayedName.slice(0, 25) + "..."}
        </Typography>

        <Typography className={classes.title}>
          {"nodesContained: (" + `${selectedNode.nodesContained.size}` + ")"}
        </Typography>
        {Array.from(selectedNode.nodesContained).map((d, i) => (
          <Typography className={classes.content} key={"nodesContained" + i}>
            {getDisplayedName(d).length <= 25
              ? getDisplayedName(d)
              : getDisplayedName(d).slice(0, 25) + "..."}
          </Typography>
        ))}
      </CardContent>
    )

    return contents;
  }

  return (
    <div className={"info-card"}>
      <Card className={"info-card root"}>
        {isStackedNode ? getStackedNodeContents(selectedNode) : getContents(selectedNode)}
      </Card>
    </div>
  );
};

export default NodeInfoCard;
