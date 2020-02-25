import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { useTestProcessedGraph } from '../hooks/useTestData';
import { GroupNode, NodeId, NodeType } from '../types/processed-graph';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(2)
    },
    treeView: {
      margin: theme.spacing(1),
      maxHeight: 400,
      flexGrow: 1,
      maxWidth: 400,
      textAlign: 'left',
      overflow: 'auto'
    },
  }),
);

export default function NodeSelector() {
  const classes = useStyles();
  const { processedGraph, graphChangeFlag, graphChanged } = useTestProcessedGraph()
  const { rootNode, nodeMap } = processedGraph

  const handleChange = (nodeId: NodeId) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const node = nodeMap[nodeId]
    node.visibility = !node.visibility
    graphChanged()
  };

  const genEleRecursively = (groupNode: GroupNode) => {
    if (groupNode === null || groupNode === undefined) return
    return Array.from(groupNode.children).map((nodeId: NodeId, index) => {
      const node = nodeMap[nodeId]
      return (
        <TreeItem key={node.id} nodeId="1" label={<FormControlLabel
          control={<Checkbox
            checked={node.visibility}
            onChange={handleChange(node.id)}
            value={node.visibility} />}
          label={node.displayedName}
        />}>
          {(node.type === NodeType.GROUP || node.type === NodeType.LAYER)
            && (node as GroupNode).expanded ?
            genEleRecursively(node as GroupNode) : null}
        </TreeItem>
      )
    })
  }


  return (
    <div className={classes.container}>
      <Typography>
        Node Filter
      </Typography>
      <TreeView
        className={classes.treeView}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {genEleRecursively(rootNode)}
      </TreeView>
    </div>

  );
}
