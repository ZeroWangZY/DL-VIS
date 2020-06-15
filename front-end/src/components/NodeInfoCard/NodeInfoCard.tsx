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

const NodeInfoCard: React.FC<{ selectedNodeId: string | null }> = (props: {
  selectedNodeId;
}) => {
  const { selectedNodeId } = props;
  const processedGraph = useProcessedGraph();
  const { nodeMap } = processedGraph;
  const selectedNode = nodeMap[selectedNodeId];
  const classes = useStyles();

  if (!selectedNodeId || !selectedNode) return null;


  const getDisplayedName = (nodeId) => {
    return nodeMap[nodeId].displayedName;
  };
  
  return (
    <div className={"info-card"}>
      <Card className={"info-card root"}>
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
      </Card>
    </div>
  );
};

export default NodeInfoCard;
