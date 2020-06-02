import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/Typography';
import * as d3 from 'd3';
import './NodeInfoCard.css'

const useStyles = makeStyles({
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'left',
  },
  content: {
    fontSize: 16,
    // marginBottom: 10,
    textAlign: 'left',
  }
})

interface NodeAttribute {
  name: string;
  value: string;
}

const NodeInfoCard: React.FC<{ selectedNodeName: string, leafAndChildrenNum: string[], inputNodeName: string[], outputNodeName: string[], nodeAttribute: NodeAttribute[], }> =
  (props: { selectedNodeName, leafAndChildrenNum, nodeAttribute, inputNodeName, outputNodeName }) => {

    const selectedNodeName = props.selectedNodeName;
    const leafAndChildrenNum = props.leafAndChildrenNum;
    const inputNodeName = props.inputNodeName;
    const outputNodeName = props.outputNodeName;
    const nodeAttribute = props.nodeAttribute;

    const classes = useStyles();

    return (
      <div className={'info-card'}>
        <Card className="info-card root"
          style={{
            top: 100,
            right: 30,
            width: 350,
            maxHeight: 200,
          }}>
          <CardContent style={{ padding: 0 }}>
            <Typography className={classes.title}
              style={{
                backgroundColor: 'RGB(233,233,233)'
              }}>
              {(selectedNodeName as string).length <= 25
                ? selectedNodeName
                : (selectedNodeName.slice(0, 25) + "...")}
            </Typography>
            <Typography className={classes.content}
              style={{
                backgroundColor: 'RGB(233,233,233)'
              }}>
              {"Children: " + `${leafAndChildrenNum[1]}` + " nodes"}
            </Typography>
            <Typography className={classes.content}
              style={{
                marginBottom: 10,
                backgroundColor: 'RGB(233,233,233)'
              }}>
              {"Subgraph: " + `${leafAndChildrenNum[0]}` + " nodes"}
            </Typography>

            <Typography className={classes.title}>
              {"Attribute: (" + `${nodeAttribute.length}` + ")"}
            </Typography>
            {nodeAttribute.map((d, i) => ( // d:[name: "xx",value: "xx"]
              // <Typography className={"Grid-cell"} key={i}>
              //   {(d.name as string).length <= 15 ? d.name : (d.name.slice(0, 15) + "...")}
              // </Typography>
              <div className={"Grid"}>
                <div className={"Grid-cell"}>
                  <text>
                    {(d.name as string).length <= 15 ? d.name : (d.name.slice(0, 15) + "...")}
                  </text>
                </div>
                <div className={"Grid-cell"}>
                  <text>
                    {d.value}
                  </text>
                </div>
              </div>
            ))}

            <Typography className={classes.title}>
              {"Inputs: (" + `${inputNodeName.length}` + ")"}
            </Typography>
            {/* TODO: 在此处加上滚动条 */}
            {inputNodeName.map((d, i) => (
              <Typography className={classes.content} key={i}>
                {(d as string).length <= 25 ? d : (d.slice(0, 25) + "...")}
              </Typography>
            ))}
            <Typography className={classes.title}>
              {"Outputs: (" + `${outputNodeName.length}` + ")"}
            </Typography>
            {outputNodeName.map((d, i) => (
              <Typography className={classes.content} key={i}>
                {(d as string).length <= 25 ? d : (d.slice(0, 25) + "...")}
              </Typography>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

export default NodeInfoCard;