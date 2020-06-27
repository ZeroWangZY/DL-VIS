import React from "react";
import { useState, useEffect } from 'react'
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
// import Crop169Icon from '@material-ui/icons/Crop169';
// import DonutLargeRoundedIcon from '@material-ui/icons/DonutLargeRounded';
// import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
// import AddTwoToneIcon from '@material-ui/icons/AddTwoTone';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
// import BackspaceOutlinedIcon from '@material-ui/icons/BackspaceOutlined';
import Ellipse from './ellipse.png'
import Rect from './rect.png'
import Circle from './circle.png'
import Delete from './delete.png'
import Add from './add.png'
import Open from './open.png'
import Close from './close.png'
import Typography from "@material-ui/core/Typography";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import {
  GroupNode,
  GroupNodeImp,
  NodeId,
  NodeType,
  DataNodeImp,
  ProcessedGraph,
  OperationNodeImp
} from "../../common/graph-processing/stage2/processed-graph";
import * as d3 from "d3";
import {
  useProcessedGraph,
  ProcessedGraphModificationType,
  modifyProcessedGraph
} from "../../store/processedGraph";
import { useGlobalConfigurations, modifyGlobalConfigurations } from '../../store/global-configuration'
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";
import './NodeSelector.css'
// import {ProcessedGraph} from "../../store/processedGraph";
declare module 'csstype' {
  interface Properties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // color: theme.palette.text.secondary,
      '&:hover > $content': {
        backgroundColor: theme.palette.action.hover,
        color: 'var(--tree-view-color)',
      },
      '&:focus > $content, &$selected > $content': {
        backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
        // color: 'var(--tree-view-color)',
      },
      '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
        backgroundColor: 'transparent',
      },
    },
    content: {
      color: theme.palette.text.secondary,
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      '$expanded > &': {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: 'inherit',
      // flexGrow: 1,
      padding: '0px 5px',
    },
    container: {
      marginTop: theme.spacing(2),
    },
    search: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
      margin: 'auto',
      width: 320,
      height: 40
    },
    treeView: {
      margin: theme.spacing(1),
      height: 600,
      flexGrow: 1,
      width: 350,
      textAlign: "left",
      overflow: "auto",
    },
    labelRoot: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0.5, 0),
    },
    backColor: {
      opacity: 1
    },
    greyColor: {
      opacity: 0.5
    },
    // icon: {
    //   '&:hover': {
    //     backgroundColor: '#ffbf00',
    //   },
    // }
  })
);

export default function NodeSelector() {
  const classes = useStyles();
  const processedGraph = useProcessedGraph();
  // const { selectedNodeId } = useGlobalConfigurations();
  const [graph, setGraph] = useState(processedGraph);
  useEffect(() => {
    setGraph(processedGraph)
  }, [processedGraph])
  const handleChange = (nodeId: NodeId) => {
    const node = graph.nodeMap[nodeId];
    modifyProcessedGraph(ProcessedGraphModificationType.MODIFY_NODE_ATTR, {
      nodeId: nodeId,
      modifyOptions: {
        visibility: !node.visibility,
      },
    });
  };
  const toggleExpanded = (id) => {
    let nodeId = id.replace(/-/g, "/");
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };
  const highligt  = (e, id) => {
    if(document.getElementsByClassName("highligh").length > 0) document.getElementsByClassName("highligh")[0].classList.remove("highligh")
    e.target.classList.add("highligh");
    let nodeId = id.replace(/-/g, "/");
    modifyGlobalConfigurations(GlobalConfigurationsModificationType.SET_SELECTEDNODE, nodeId)
  }
  const handleSearchChange= (searchText: string) => {
    let nodeMap = {}  //这边为浅拷贝所以不行？？咋办
    // let nodeMap = useProcessedGraph().nodeMap;
    function search(searchText: string, groupNode: GroupNode){
      if (groupNode === null || groupNode === undefined) return;
      let newSet: Set<string> = new Set();
      for (var nodeId of groupNode.children){
            const node = processedGraph.nodeMap[nodeId]
            nodeMap[nodeId] = {...processedGraph.nodeMap[nodeId]}
            if((node.type === NodeType.GROUP || node.type === NodeType.LAYER)) {
                  let children = search(searchText, node as GroupNode )
                  children.size&&newSet.add(nodeId);
                  (nodeMap[nodeId] as GroupNode).children = children
              }
            if(nodeId.search(searchText) !== -1){
              newSet.add(nodeId);
            }
      }
      return newSet
    }
      let result = {
        rootNode: {...processedGraph.rootNode, children: search(searchText, processedGraph.rootNode)},
        nodeMap
      } 
      setGraph(result as ProcessedGraph)
  }
  const getLabelContainer = (node) => {
    if(node.type=== NodeType.OPERATION) { //ellipse
      // return  <RadioButtonUncheckedIcon color="inherit" className={classes.labelIcon}/>
      return <img src={Ellipse} className={classes.labelIcon}/>
    }else if(node.type=== NodeType.GROUP || node.type=== NodeType.LAYER){    //rect
      // return  <Crop169Icon color="inherit" className={classes.labelIcon}/>
      return <img src={Rect} className={classes.labelIcon}/>
    }else if(node.type=== NodeType.DATA){ //circle
      // return  <DonutLargeRoundedIcon color="inherit" className={classes.labelIcon}/>
      return <img src={Circle} className={classes.labelIcon}/>
    }
    return ''
  }
  const genEleRecursively = (groupNode: GroupNode) => {
    if (groupNode === null || groupNode === undefined) return;
    return Array.from(groupNode.children).map((nodeId: NodeId, index) => {
      const node = graph.nodeMap[nodeId];
      if(!node) return;
      return (
        <TreeItem
          key={node.id}
          className={node.visibility ?classes.backColor:classes.greyColor}
          nodeId={node.id}
          label={
            <div className={classes.labelRoot}>
            {getLabelContainer(node)}
            <Typography variant="body2"  style={{ flexGrow: 1 }}>
              <span className={classes.labelText} onClick={(e) => highligt(e, node.id)}>
                {node.displayedName}
              </span>
            </Typography>
            {(node.type === NodeType.GROUP || node.type === NodeType.LAYER) ? <img src={Open} onClick={() => toggleExpanded(node.id)}/>:null}
            {node.visibility ? <img src={Delete} onClick={() => handleChange(node.id)}/>:<img src={Add} onClick={() => handleChange(node.id)}/>}
          </div>
          }
          classes={{
            root: classes.root,
            content: classes.content,
          }}
          style={{
            '--tree-view-color': "#c7000b",
            '--tree-view-bg-color': "none",
          }}
          onMouseOver={()=>{}}
        >
          {(node.type === NodeType.GROUP || node.type === NodeType.LAYER)
            ? genEleRecursively(node as GroupNode)
            : null}
        </TreeItem>
      );
    });
  };

  return (
    <div className={classes.container}>
      <Typography>Node Filter</Typography>
      <Paper component="form" className={classes.search} variant="outlined">
      {/* <div className={classes.search}> */}
      <IconButton aria-label="search">
        <SearchIcon />
      </IconButton>
      <InputBase
        placeholder="Search"
        inputProps={{ 'aria-label': 'search' }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(event.target.value)}
      />
      {/* </div> */}
      </Paper>
      <TreeView
        className={classes.treeView}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {genEleRecursively(graph.rootNode)}
      </TreeView>
    </div>
  );
}
