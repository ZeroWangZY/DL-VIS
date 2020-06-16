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
  OperationNode,
} from "../../common/graph-processing/stage2/processed-graph";

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

const NodeInfoCard: React.FC<{ selectedNodeId: string | string[] | null }> = (props: {
  selectedNodeId;
}) => {
  const isStringArray = (x: any): boolean => { // 判断传入的参数是不是string[]
    return (x !== null && typeof selectedNodeId === "object");
  }
  const { selectedNodeId } = props;
  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;
  let selectedNodes = [];

  if (isStringArray(selectedNodeId)) { // 如果传入的参数是string数组
    for (let id of selectedNodeId)
      selectedNodes.push(nodeMap[id]);
  } else if (selectedNodeId !== null) { // 传入的参数是string
    selectedNodes.push(nodeMap[selectedNodeId]);
  }
  //  如果selectedNodeId是null，则selectedNodes是一个空数组
  // 否则，selectedNodes是一个数组，包含所有选中节点
  const classes = useStyles();

  const getDisplayedName = (nodeId) => {
    return nodeMap[nodeId].displayedName;
  };

  const getContents = (selectedNodes): any[] => { // 如果选中多个节点，则将每个节点信息依次展示
    let contents = [];
    for (let selectedNode of selectedNodes) {
      if (selectedNode === undefined || selectedNode === null) continue;
      contents.push(
        <CardContent style={{ padding: 0 }}>
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
            </>
          )}

          <Typography className={classes.title}>
            {"Inputs: (" + `${selectedNode.inputNode.size}` + ")"}
          </Typography>
          {Array.from(selectedNode.inputNode).map((d, i) => (
            <Typography className={classes.content} key={i}>
              {getDisplayedName(d).length <= 25
                ? getDisplayedName(d)
                : getDisplayedName(d).slice(0, 25) + "..."}
            </Typography>
          ))}
          <Typography className={classes.title}>
            {"Outputs: (" + `${selectedNode.outputNode.size}` + ")"}
          </Typography>
          {Array.from(selectedNode.outputNode).map((d, i) => (
            <Typography className={classes.content} key={i}>
              {getDisplayedName(d).length <= 25
                ? getDisplayedName(d)
                : getDisplayedName(d).slice(0, 25) + "..."}
            </Typography>
          ))}
        </CardContent>
      )
    }
    return contents;
  }

  return (
    <div className={"info-card"}>
      <Card className={"info-card root"}>
        {getContents(selectedNodes)}
      </Card>
    </div>
  );
};

export default NodeInfoCard;
