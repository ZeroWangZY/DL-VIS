import React, { Children } from "react";
import { useState, useEffect } from "react";
import {
  makeStyles,
  Theme,
  createStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
// import Crop169Icon from '@material-ui/icons/Crop169';
// import DonutLargeRoundedIcon from '@material-ui/icons/DonutLargeRounded';
// import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
// import AddTwoToneIcon from '@material-ui/icons/AddTwoTone';
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import SearchIcon from "@material-ui/icons/Search";
import IconButton from "@material-ui/core/IconButton";
// import BackspaceOutlinedIcon from '@material-ui/icons/BackspaceOutlined';
import Ellipse from "./ellipse.png";
import Rect from "./rect.png";
import Circle from "./circle.png";
import Delete from "./delete.png";
import Stacked from "./stacked.png";
import Add from "./add.png";
import Open from "./open.png";
import Close from "./close.png";
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
  OperationNodeImp,
  LayerNodeImp,
  ROOT_SCOPE,
} from "../../common/graph-processing/stage2/processed-graph";
import { StackedOpNode, StackedOpNodeImp } from "../../common/graph-processing/stage3/vis-graph.type"
import * as d3 from "d3";
import {
  useProcessedGraph,
  ProcessedGraphModificationType,
  modifyProcessedGraph,
} from "../../store/processedGraph";
import {
  useGlobalConfigurations,
  modifyGlobalConfigurations,
} from "../../store/global-configuration";
import { useVisGraph } from "../../store/visGraph";
import { GlobalConfigurationsModificationType } from "../../store/global-configuration.type";
import {
  useGlobalStates,
  modifyGlobalStates,
} from "../../store/global-states";
import { GlobalStatesModificationType } from "../../store/global-states.type";

import "./NodeSelector.css";
// import {ProcessedGraph} from "../../store/processedGraph";
declare module "csstype" {
  interface Properties {
    "--tree-view-color"?: string;
    "--tree-view-bg-color"?: string;
    "--tree-view-font-color"?: string;
  }
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // color: theme.palette.text.secondary,
      "&:hover > $content": {
        backgroundColor: theme.palette.action.hover,
        color: "var(--tree-view-color)",
      },
      "&:focus > $content, &$selected > $content": {
        backgroundColor: `var(--tree-view-bg-color, --tree-view-font-color)`,
        // color: 'var(--tree-view-color)',
      },
      "&:focus > $content $label, &:hover > $content $label, &$selected > $content $label": {
        backgroundColor: "transparent",
      },
    },
    content: {
      color: "var(--tree-view-font-color)",
      paddingRight: theme.spacing(1),
      fontWeight: theme.typography.fontWeightMedium,
      "$expanded > &": {
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
    labelIcon: {
      marginRight: theme.spacing(1),
    },
    labelText: {
      fontWeight: "inherit",
      flexGrow: 1,
      userSelect: "none",
    },
    selectedLabelText: {
      fontWeight: "inherit",
      // flexGrow: 1,
      userSelect: "none",
      color: "white",
      backgroundColor: "#c7000b",
      paddingLeft: "5px",
      paddingRight: "5px",
    },
    container: {
      position: "absolute",
      top: "125px",
      bottom: 0,
      display: "flex",
      flexDirection: "column",
      // marginTop: theme.spacing(2),
      // height: "100%"
    },
    search: {
      padding: "2px 4px",
      display: "flex",
      alignItems: "center",
      margin: "auto",
      width: 320,
      height: 32,
    },
    treeView: {
      margin: theme.spacing(1),
      // height: "800px",
      flexGrow: 1,
      width: 350,
      textAlign: "left",
      overflow: "auto",
    },
    labelRoot: {
      display: "flex",
      alignItems: "center",
      padding: theme.spacing(0.5, 0),
    },
    lastImg: { // 右对齐
      marginLeft: "auto",
    },
    backColor: {
      opacity: 1,
    },
    greyColor: {
      opacity: 0.5,
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
  const { selectedNodeId } = useGlobalStates();
  const visGraph = useVisGraph();

  const [graph, setGraph] = useState(processedGraph);
  useEffect(() => {
    setGraph(processedGraph);
  }, [processedGraph]);

  const [subTree, setSubTree] = useState(new Map<NodeId, Set<NodeId>>());
  const [visNodes, setVisNodes] = useState([]);
  const [visNodeMap, setVisNodeMap] = useState({});

  useEffect(() => {
    if (!visGraph) return
    const { visNodes, visNodeMap, rootNode } = visGraph;
    const nodeMap = visGraph.visNodeMap;
    const visNodeSet = new Set(visNodes)
    const resTree = new Map<NodeId, Set<NodeId>>()
    resTree.set(ROOT_SCOPE, new Set(rootNode.children))
    const queue = Array.from(rootNode.children)
    while (queue.length > 0) {
      const nodeId = queue.shift()
      const node = visNodeMap[nodeId]
      if (node.type === NodeType.GROUP || node.type === NodeType.LAYER) {
        for (const child of (node as GroupNode).children) {
          const childNode = visNodeMap[child]
          if (visNodeSet.has(child) || !childNode.visibility) {
            queue.push(child)
            if (resTree.get(nodeId)) {
              resTree.get(nodeId).add(child)
            } else {
              resTree.set(nodeId, new Set([child]))
            }
          }
        }
      }
    }

    for (const nodeId of visNodes) {
      const node = visNodeMap[nodeId]
      if (node instanceof StackedOpNodeImp) {
        resTree.get(node.parent).add(nodeId)
      }
    }

    setVisNodes(visGraph.visNodes);
    setVisNodeMap(visGraph.visNodeMap);
    setSubTree(resTree)
  }, [visGraph])

  if (!visGraph || !processedGraph) return (<div />);

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
    modifyProcessedGraph(ProcessedGraphModificationType.TOGGLE_EXPANDED, {
      nodeId: id,
    });
  };
  const highlight = (e, id) => {
    // if (document.getElementsByClassName("highligh").length > 0)
    //   document
    //     .getElementsByClassName("highligh")[0]
    //     .classList.remove("highligh");
    // e.target.classList.add("highligh");
    // let nodeId = id.replace(/-/g, "/");
    modifyGlobalStates(
      GlobalStatesModificationType.SET_SELECTEDNODE,
      id,
    );
  };
  const handleSearchChange = (searchText: string) => {
    let nodeMap = {}; //这边为浅拷贝所以不行？？咋办
    // let nodeMap = useProcessedGraph().nodeMap;
    function search(searchText: string, groupNode: GroupNode) {
      if (groupNode === null || groupNode === undefined) return;
      let newSet: Set<string> = new Set();
      for (var nodeId of groupNode.children) {
        const node = processedGraph.nodeMap[nodeId];
        nodeMap[nodeId] = { ...processedGraph.nodeMap[nodeId] };
        if (node.type === NodeType.GROUP || node.type === NodeType.LAYER) {
          let children = search(searchText, node as GroupNode);
          children.size && newSet.add(nodeId);
          (nodeMap[nodeId] as GroupNode).children = children;
        }
        if (nodeId.search(searchText) !== -1) {
          newSet.add(nodeId);
        }
      }
      return newSet;
    }
    let result = {
      rootNode: {
        ...processedGraph.rootNode,
        children: search(searchText, processedGraph.rootNode),
      },
      nodeMap,
    };
    setGraph(result as ProcessedGraph);
  };
  const getLabelContainer = (node) => {
    if (node instanceof StackedOpNodeImp) { // TODO : 换成堆叠子图的图标
      return <img src={Stacked} className={classes.labelIcon} />;
    } else if (node.type === NodeType.OPERATION) {
      return <img src={Ellipse} className={classes.labelIcon} />;
    } else if (node.type === NodeType.GROUP || node.type === NodeType.LAYER) {
      return <img src={Rect} className={classes.labelIcon} />;
    } else if (node.type === NodeType.DATA) {
      return <img src={Circle} className={classes.labelIcon} />;
    }
    return "";
  };

  const genElement = (childNodes: Set<string>) => {
    if (!childNodes) return;

    return Array.from(childNodes).map((nodeId: NodeId, index) => {
      const visNode = visNodeMap[nodeId];
      // if (!visNode) return (<div />);
      let displayedName = visNode.displayedName
      .replace(/Default/g, "Main")
      return (
        <TreeItem
          key={visNode.id}
          className={visNode.visibility ? classes.backColor : classes.greyColor}
          nodeId={visNode.id}
          label={
            <div className={classes.labelRoot}>
              {getLabelContainer(visNode)}
              <span
                className={visNode.id === selectedNodeId ? classes.selectedLabelText : classes.labelText}
                onClick={(e) => highlight(e, visNode.id)}
                onDoubleClick={(e) => toggleExpanded(visNode.id)}
              >
                {displayedName.length > 25
                  ? displayedName.slice(0, 25) + "..."
                  : displayedName}
              </span>
              {!(visNode instanceof StackedOpNodeImp) &&
                (
                  visNode.visibility ? (
                    <img className={classes.lastImg} src={Delete} onClick={() => handleChange(visNode.id)} />
                  ) : (
                      <img className={classes.lastImg} src={Add} onClick={() => handleChange(visNode.id)} />
                    )
                )
              }
            </div>
          }
          classes={{
            root: classes.root,
            content: classes.content,
          }}
          style={{
            "--tree-view-color": "#c7000b",
            "--tree-view-bg-color": "none",
          }}
          onMouseOver={() => { }}
        >
          {(visNode.type === NodeType.GROUP && (visNode as GroupNodeImp).expanded) || (visNode.type === NodeType.LAYER && (visNode as LayerNodeImp).expanded)
            ? genElement(subTree.get(visNode.id))
            : null}
        </TreeItem>
      );
    });
  }

  const theme = createMuiTheme({
    typography: {
      fontFamily: [
        "Helvetica Neue",
        "Helvetica",
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft YaHei",
        "Arial",
        "sans-serif",
      ].join(","),
      htmlFontSize: 18.2857,
    },
    palette: {
      primary: {
        main: "#333",
      },
    },
  });

  return (
    <div className={classes.container}>
      {/* <Typography>Node Filter</Typography> */}
      <ThemeProvider theme={theme}>
        <Paper
          component="form"
          className={classes.search}
          variant="outlined"
          style={{ color: "primary" }}
        >
          {/* <div className={classes.search}> */}
          <IconButton aria-label="search">
            <SearchIcon />
          </IconButton>
          <InputBase
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchChange(event.target.value)
            }
          />
          {/* </div> */}
        </Paper>
        <TreeView
          style={{ color: "primary" }}
          className={classes.treeView}
          defaultExpanded={visNodes}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {genElement(subTree.get(ROOT_SCOPE))}
        </TreeView>
      </ThemeProvider>
    </div>
  );
}
