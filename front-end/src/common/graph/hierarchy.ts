import {
  SlimGraph, SeriesGroupingType, GroupNode, Metanode, OpNode,
  Metaedge, createMetanode, ROOT_NAME, createGraph, GraphType,
  createMetaedge, Node, MetaedgeImpl, MetanodeImpl, getHierarchicalPath,
  FUNCTION_LIBRARY_NODE, NodeType, NAMESPACE_DELIM, SeriesNode,
  getSeriesNodeName, createSeriesNode
} from './graph'
import { detect } from './template'
import * as graphlib from 'graphlib'
import * as d3 from "d3";

const _ = require('lodash')

export interface Edges {
  control: Metaedge[];
  regular: Metaedge[];
}


export interface HierarchyParams {
  verifyTemplate: boolean;
  seriesNodeMinSize: number;
  seriesMap: { [name: string]: SeriesGroupingType };
}

export interface Hierarchy {
  root: Metanode;
  libraryFunctions: { [key: string]: Metanode };
  templates: { [templateId: string]: string[] };
  /** List of all device names */
  devices: string[];
  /** List of all XLA cluster names */
  xlaClusters: string[];
  /** True if at least one tensor in the graph has shape information */
  hasShapeInfo: boolean;
  /** The maximum size across all meta edges. Used for scaling thickness. */
  maxMetaEdgeSize: number;
  getNodeMap(): { [nodeName: string]: GroupNode | OpNode };
  node(name: string): GroupNode | OpNode;
  setNode(name: string, node: GroupNode | OpNode): void;
  getBridgegraph(nodeName: string): graphlib.Graph<GroupNode | OpNode, Metaedge>;
  getPredecessors(nodeName: string): Edges;
  getSuccessors(nodeName: string): Edges;
  getTopologicalOrdering(nodeName: string): { [childName: string]: number };
  getTemplateIndex(): (string) => number;
}


class HierarchyImpl implements Hierarchy {
  root: Metanode;
  libraryFunctions: { [key: string]: Metanode };
  templates: { [templateId: string]: string[] };
  private index: { [nodeName: string]: GroupNode | OpNode };
  devices: string[];
  xlaClusters: string[];
  hasShapeInfo = false;
  maxMetaEdgeSize = 1;
  orderings: { [nodeName: string]: { [childName: string]: number } };

  constructor() {
    this.root = createMetanode(ROOT_NAME, { compound: true });
    this.libraryFunctions = {};
    this.templates = null;
    this.devices = null;
    /**
     * @type {Object} Dictionary object that maps node name to the node
     * (could be op-node, metanode, or series-node)
     */
    this.index = {};
    this.index[ROOT_NAME] = this.root;
    this.orderings = {};
  }

  getNodeMap(): { [nodeName: string]: GroupNode | OpNode } {
    return this.index;
  }

  node(name: string): GroupNode | OpNode {
    return this.index[name];
  }

  setNode(name: string, node: GroupNode | OpNode): void {
    this.index[name] = node;
  }


  getBridgegraph(nodeName: string): graphlib.Graph<GroupNode | OpNode, Metaedge> {
    let node = this.index[nodeName];
    if (!node) {
      throw Error('Could not find node in hierarchy: ' + nodeName);
    }
    if (!('metagraph' in node)) {
      return null;
    }
    let groupNode = <GroupNode>node;
    if (groupNode.bridgegraph) {
      return groupNode.bridgegraph;
    }
    let bridgegraph = groupNode.bridgegraph =
      createGraph<GroupNode | OpNode, Metaedge>(
        'BRIDGEGRAPH', GraphType.BRIDGE);
    if (!node.parentNode || !('metagraph' in node.parentNode)) {
      return bridgegraph;
    }

    let parentNode = <GroupNode>node.parentNode;
    let parentMetagraph = parentNode.metagraph;
    let parentBridgegraph = this.getBridgegraph(parentNode.name);


    _.each([parentMetagraph, parentBridgegraph], parentGraph => {
      _(parentGraph.edges())
        .filter(e => e.v === nodeName || e.w === nodeName)
        .each(parentEdgeObj => {

          let inbound = parentEdgeObj.w === nodeName;
          let parentMetaedge = parentGraph.edge(parentEdgeObj);


          _.each(parentMetaedge.baseEdgeList, baseEdge => {

            let [descendantName, otherName] =
              inbound ?
                [baseEdge.w, parentEdgeObj.v] :
                [baseEdge.v, parentEdgeObj.w];

            let childName = this.getChildName(nodeName, descendantName);

            let bridgeEdgeObj = <graphlib.EdgeObject>{
              v: inbound ? otherName : childName,
              w: inbound ? childName : otherName,
            };
            let bridgeMetaedge = bridgegraph.edge(bridgeEdgeObj);
            if (!bridgeMetaedge) {
              bridgeMetaedge = createMetaedge(bridgeEdgeObj.v, bridgeEdgeObj.w);
              bridgeMetaedge.inbound = inbound;
              bridgegraph.setEdge(bridgeEdgeObj.v, bridgeEdgeObj.w,
                bridgeMetaedge);
            }

            // Copy the BaseEdge from the parent's Metaedge into this
            // bridgegraph Metaedge.
            bridgeMetaedge.addBaseEdge(baseEdge, this);
          });
        })
        .value(); // force lodash chain execution.
    });

    return bridgegraph;
  }


  getChildName(nodeName: string, descendantName: string): string {
    // Walk up the hierarchy from the descendant to find the child.
    let currentNode: Node = this.index[descendantName];
    while (currentNode) {
      if (currentNode.parentNode && currentNode.parentNode.name === nodeName) {
        return currentNode.name;
      }
      currentNode = currentNode.parentNode;
    }
    throw Error(
      'Could not find immediate child for descendant: ' + descendantName);
  };

  /** Given the name of a node, return its incoming metaedges. */
  getPredecessors(nodeName: string): Edges {
    let node = this.index[nodeName];
    if (!node) {
      throw Error('Could not find node with name: ' + nodeName);
    }

    let predecessors = this.getOneWayEdges(node, true);
    // Add embedded predecessors, such as constants.
    if (!node.isGroupNode) {
      _.each((<OpNode>node).inEmbeddings, embeddedNode => {
        _.each((<OpNode>node).inputs, input => {
          if (input.name === embeddedNode.name) {
            // Make a new metaedge holding the edge between the
            // node and the in-embedding.
            let metaedge = new MetaedgeImpl(embeddedNode.name, nodeName);
            metaedge.addBaseEdge(
              {
                isControlDependency: input.isControlDependency,
                outputTensorKey: input.outputTensorKey,
                isReferenceEdge: false,
                v: embeddedNode.name,
                w: nodeName
              },
              this);
            predecessors.regular.push(metaedge);
          }
        });
      });
    }
    return predecessors;
  }


  getSuccessors(nodeName: string): Edges {
    let node = this.index[nodeName];
    if (!node) {
      throw Error('Could not find node with name: ' + nodeName);
    }

    let successors = this.getOneWayEdges(node, false);

    // Add embedded successors, such as summaries.
    if (!node.isGroupNode) {
      _.each((<OpNode>node).outEmbeddings, embeddedNode => {
        _.each(embeddedNode.inputs, input => {
          if (input.name === nodeName) {
            // Make a new metaedge holding the edge between the
            // node and the out-embedding.
            let metaedge = new MetaedgeImpl(nodeName, embeddedNode.name);
            metaedge.addBaseEdge(
              {
                isControlDependency: input.isControlDependency,
                outputTensorKey: input.outputTensorKey,
                isReferenceEdge: false,
                v: nodeName,
                w: embeddedNode.name
              },
              this);
            successors.regular.push(metaedge);
          }
        });
      });
    }
    return successors;
  }

  /** Helper method for getPredecessors and getSuccessors */
  getOneWayEdges(node: GroupNode | OpNode, inEdges: boolean) {
    let edges: Edges = { control: [], regular: [] };
    // A node with no parent cannot have any edges.
    if (!node.parentNode || !node.parentNode.isGroupNode) {
      return edges;
    }
    let parentNode = <GroupNode>node.parentNode;
    let metagraph = parentNode.metagraph;
    let bridgegraph = this.getBridgegraph(parentNode.name);
    findEdgeTargetsInGraph(metagraph, node, inEdges, edges);
    findEdgeTargetsInGraph(bridgegraph, node, inEdges, edges);
    return edges;
  }

  getTopologicalOrdering(nodeName: string): { [childName: string]: number } {
    let node = this.index[nodeName];
    if (!node) {
      throw Error('Could not find node with name: ' + nodeName);
    }
    if (!node.isGroupNode) {
      return null;
    }
    if (nodeName in this.orderings) {
      return this.orderings[nodeName];
    }

    // Mapping of a child node names to lists of their successors.
    let successors: { [childName: string]: string[] } = {};

    // Set of node names which have appeared as a destination.
    let destinations: { [childName: string]: boolean } = {};

    let metagraph = (<GroupNode>node).metagraph;
    _.each(metagraph.edges(), (e: graphlib.EdgeObject) => {
      if (!metagraph.edge(e).numRegularEdges) {
        return; // Skip control edges.
      }

      // Keep track of successors and destinations.
      if (!(e.v in successors)) {
        successors[e.v] = [];
      }
      successors[e.v].push(e.w);
      destinations[e.w] = true;
    });

    // Seed the queue with true sources (those that are not destinations).
    let queue: string[] =
      _.difference(_.keys(successors), _.keys(destinations));

    // Produce an ordering by traversing the graph breadth first.
    let ordering = this.orderings[nodeName] = {};
    let index = 0;
    while (queue.length) {
      let childName = queue.shift();
      ordering[childName] = index++;
      _.each(successors[childName], succName => queue.push(succName));
      delete successors[childName]; // Prevent cycles from infinite looping.
    }
    return ordering;
  }

  /**
   * Returns a d3 Ordinal function that can be used to look up the index of
   * a node based on its template id.
   */
  getTemplateIndex(): (string) => number {
    let templateNames = d3.keys(this.templates);
    let templateIndex = d3.scaleOrdinal()
      .domain(templateNames)
      .range(d3.range(0, templateNames.length));
    return (templateId: string) => <number>templateIndex(templateId);
  }
}

function findEdgeTargetsInGraph(
  graph: graphlib.Graph<GroupNode | OpNode, Metaedge>,
  node: Node, inbound: boolean, targets: Edges): void {
  let edges = inbound ? graph.inEdges(node.name) : graph.outEdges(node.name);
  _.each(edges, e => {
    let metaedge = graph.edge(e);
    let targetList =
      metaedge.numRegularEdges ? targets.regular : targets.control;
    targetList.push(metaedge);
  });
}

function addNodes(h: Hierarchy, graph: SlimGraph) {
  _.each(graph.nodes, (node, nodeName) => {
    let path = getHierarchicalPath(node.name);
    let parent: Metanode = h.root;

    parent.depth = Math.max(path.length, parent.depth);

    // Create parent metanodes for each depth. For example if the node name
    // is 'a/b/c', then create metanodes 'a' and 'a/b', where 'a/b' is a child
    // of a.
    for (let i = 0; i < path.length; i++) {
      parent.depth = Math.max(parent.depth, path.length - i);
      parent.cardinality += node.cardinality;
      parent.opHistogram[node.op] = (parent.opHistogram[node.op] || 0) + 1;
      if (node.device != null) {
        parent.deviceHistogram[node.device] =
          (parent.deviceHistogram[node.device] || 0) + 1;
      }

      // Increment parents appropriate compatibility count
      if (node.compatible) {
        parent.compatibilityHistogram.compatible =
          (parent.compatibilityHistogram.compatible || 0) + 1;
      } else {
        parent.compatibilityHistogram.incompatible =
          (parent.compatibilityHistogram.incompatible || 0) + 1;
      }

      // Increment capability counts for in and out embeddings
      _.each(node.inEmbeddings, (inNode) => {
        if (inNode.compatible) {
          parent.compatibilityHistogram.compatible =
            (parent.compatibilityHistogram.compatible || 0) + 1;
        } else {
          parent.compatibilityHistogram.incompatible =
            (parent.compatibilityHistogram.incompatible || 0) + 1;
        }
      });

      _.each(node.outEmbeddings, (outNode) => {
        if (outNode.compatible) {
          parent.compatibilityHistogram.compatible =
            (parent.compatibilityHistogram.compatible || 0) + 1;
        } else {
          parent.compatibilityHistogram.incompatible =
            (parent.compatibilityHistogram.incompatible || 0) + 1;
        }
      });

      if (i === path.length - 1) { break; }
      let name = path[i];
      let child = <Metanode>h.node(name);
      if (!child) {
        child = createMetanode(name);
        child.parentNode = parent;
        h.setNode(name, child);
        parent.metagraph.setNode(name, child);
      }
      parent = child;
    }
    // Assuming node name is 'a/b/c', assign the OpNode as a child of the
    // metanode 'a/b'.
    h.setNode(node.name, node);
    node.parentNode = parent;
    parent.metagraph.setNode(node.name, node);

    // Add each of the in-embeddings and out-embeddings in the hierarchy.
    _.each(node.inEmbeddings, function (embedding) {
      h.setNode(embedding.name, embedding);
      embedding.parentNode = node;
    });
    _.each(node.outEmbeddings, function (embedding) {
      h.setNode(embedding.name, embedding);
      embedding.parentNode = node;
    });
  });

  const libraryFunctionNode =
    h.node(FUNCTION_LIBRARY_NODE) as Metanode;
  if (libraryFunctionNode) {
    // This graph has a function library. Remove the library from the root node
    // itself. We later dynamically add copies of functions into metanodes that
    // are actually function calls.
    const rootNode = libraryFunctionNode.parentNode as Metanode;
    rootNode.metagraph.removeNode(libraryFunctionNode.name);

    // Add all of the library function node's children to a mapping. All of the
    // nodes within this special node for library functions are themselves
    // metanodes for library functions.
    _.each(libraryFunctionNode.metagraph.nodes(), functionNodeName => {
      const childNode =
        libraryFunctionNode.metagraph.node(functionNodeName) as Metanode;
      if (childNode.type === NodeType.META) {
        const functionName = functionNodeName.substring(
          FUNCTION_LIBRARY_NODE.length +
          NAMESPACE_DELIM.length);
        h.libraryFunctions[functionName] = childNode;
      }
    });
  }
};

function groupSeries(metanode: Metanode, hierarchy: Hierarchy,
  seriesNames: { [name: string]: string }, threshold: number,
  map: { [name: string]: SeriesGroupingType }) {
  let metagraph = metanode.metagraph;
  _.each(metagraph.nodes(), n => {
    let child = metagraph.node(n);
    if (child.type === NodeType.META) {
      groupSeries(<Metanode>child, hierarchy, seriesNames, threshold, map);
    }
  });

  let clusters = clusterNodes(metagraph);
  let seriesDict = detectSeries(clusters, metagraph);

  // Add each series node to the graph and add its grouped children to its own
  // metagraph.
  _.each(seriesDict, function (seriesNode: SeriesNode, seriesName: string) {
    let nodeMemberNames = seriesNode.metagraph.nodes();
    _.each(nodeMemberNames, n => {
      let child = <OpNode>metagraph.node(n);
      if (!child.owningSeries) {
        child.owningSeries = seriesName;
      }
    });
    // If the series contains less than the threshold number of nodes and
    // this series has not been adding to the series map, then set this
    // series to be shown ungrouped in the map.
    if (nodeMemberNames.length < threshold && !(seriesNode.name in map)) {
      map[seriesNode.name] = SeriesGroupingType.UNGROUP;
    }
    // If the series is in the map as ungrouped then do not group the series.
    if (seriesNode.name in map
      && map[seriesNode.name] === SeriesGroupingType.UNGROUP) {
      return;
    }
    hierarchy.setNode(seriesName, seriesNode); // add to the index
    metagraph.setNode(seriesName, seriesNode);
    _.each(nodeMemberNames, n => {
      let child = <OpNode>metagraph.node(n);
      seriesNode.metagraph.setNode(n, child);
      seriesNode.parentNode = child.parentNode;
      seriesNode.cardinality++;
      if (child.device != null) {
        seriesNode.deviceHistogram[child.device] =
          (seriesNode.deviceHistogram[child.device] || 0) + 1;
      }

      // Increment parents appropriate compatibility count
      if (child.compatible) {
        seriesNode.compatibilityHistogram.compatible =
          (seriesNode.compatibilityHistogram.compatible || 0) + 1;
      } else {
        seriesNode.compatibilityHistogram.incompatible =
          (seriesNode.compatibilityHistogram.incompatible || 0) + 1;
      }

      // Increment capability counts for in and out embeddings
      _.each(child.inEmbeddings, (inNode) => {
        if (inNode.compatible) {
          seriesNode.compatibilityHistogram.compatible =
            (seriesNode.compatibilityHistogram.compatible || 0) + 1;
        } else {
          seriesNode.compatibilityHistogram.incompatible =
            (seriesNode.compatibilityHistogram.incompatible || 0) + 1;
        }
      });

      _.each(child.outEmbeddings, (outNode) => {
        if (outNode.compatible) {
          seriesNode.compatibilityHistogram.compatible =
            (seriesNode.compatibilityHistogram.compatible || 0) + 1;
        } else {
          seriesNode.compatibilityHistogram.incompatible =
            (seriesNode.compatibilityHistogram.incompatible || 0) + 1;
        }
      });

      child.parentNode = seriesNode;
      seriesNames[n] = seriesName;
      // Remove now-grouped node from its original parent's metagraph.
      metagraph.removeNode(n);
    });
  });
};

function addEdges(h: Hierarchy, graph: SlimGraph,
  seriesNames: { [name: string]: string }) {

  let nodeIndex = h.getNodeMap();


  let sourcePath: string[] = [];
  let destPath: string[] = [];

  let getPath = (node: Node, path: string[]): number => {
    let i = 0;
    while (node) {
      path[i++] = node.name;
      node = node.parentNode;
    }
    return i - 1;
  };

  _.each(graph.edges, baseEdge => {

    let sourceAncestorIndex = getPath(graph.nodes[baseEdge.v], sourcePath);
    let destAncestorIndex = getPath(graph.nodes[baseEdge.w], destPath);


    if (sourceAncestorIndex === -1 || destAncestorIndex === -1) {
      return;
    }

    while (sourcePath[sourceAncestorIndex] === destPath[destAncestorIndex]) {
      sourceAncestorIndex--;
      destAncestorIndex--;
      if (sourceAncestorIndex < 0 || destAncestorIndex < 0) {
        throw Error('No difference found between ancestor paths.');
      }
    }

    let sharedAncestorNode =
      <GroupNode>nodeIndex[sourcePath[sourceAncestorIndex + 1]];
    let sourceAncestorName = sourcePath[sourceAncestorIndex];
    let destAncestorName = destPath[destAncestorIndex];


    let metaedge =
      sharedAncestorNode.metagraph.edge(sourceAncestorName, destAncestorName);
    if (!metaedge) {
      metaedge = createMetaedge(sourceAncestorName, destAncestorName);
      sharedAncestorNode.metagraph
        .setEdge(sourceAncestorName, destAncestorName, metaedge);
    }
    if (!sharedAncestorNode.hasNonControlEdges &&
      !baseEdge.isControlDependency) {
      sharedAncestorNode.hasNonControlEdges = true;
    }
    metaedge.addBaseEdge(baseEdge, h);
  });
};

function clusterNodes(metagraph: graphlib.Graph<GroupNode | OpNode, Metaedge>): { [clusterId: string]: string[] } {
  let result: { [clusterId: string]: string[] } = {};
  return _.reduce(metagraph.nodes(),
    (clusters: { [clusterId: string]: string[] }, n: string) => {
      let child = metagraph.node(n);
      if (child.type === NodeType.META) {
        // skip metanodes
        return clusters;
      }
      let template = (<OpNode>child).op;
      if (template) {
        clusters[template] = clusters[template] || [];
        clusters[template].push(child.name);
      }
      return clusters;
    }, result);
}

function addSeriesToDict(seriesNodes: SeriesNode[],
  seriesDict: { [seriesName: string]: SeriesNode },
  clusterId: number,
  metagraph: graphlib.Graph<GroupNode | OpNode, Metaedge>) {
  if (seriesNodes.length > 1) {
    let curSeriesName = getSeriesNodeName(
      seriesNodes[0].prefix, seriesNodes[0].suffix,
      seriesNodes[0].parent, seriesNodes[0].clusterId,
      seriesNodes[seriesNodes.length - 1].clusterId);
    let curSeriesNode = createSeriesNode(seriesNodes[0].prefix,
      seriesNodes[0].suffix, seriesNodes[0].parent, clusterId,
      curSeriesName);
    _.each(seriesNodes, function (node) {
      curSeriesNode.ids.push(node.clusterId);
      curSeriesNode.metagraph.setNode(node.name, metagraph.node(node.name));
    });
    seriesDict[curSeriesName] = curSeriesNode;
  }
}
function detectSeries(clusters: { [clusterId: string]: string[] },
  metagraph: graphlib.Graph<GroupNode | OpNode, Metaedge>): { [seriesName: string]: SeriesNode } {
  let seriesDict: { [seriesName: string]: SeriesNode } = {};
  _.each(clusters, function (members, clusterId: string) {
    if (members.length <= 1) { return; } // isolated clusters can't make series

    /** @type {Object}  A dictionary mapping seriesName to seriesInfoArray,
     * which is an array that contains objects with name, id, prefix, suffix,
     * and parent properties.
     */
    let candidatesDict: { [seriesName: string]: SeriesNode[] } = {};

    // Group all nodes that have the same name, with the exception of a
    // number at the end of the name after an underscore, which is allowed to
    // vary.
    _.each(members, function (name: string) {
      let isGroup = name.charAt(name.length - 1) === '*';
      let namepath = name.split('/');
      let leaf = namepath[namepath.length - 1];
      let parent = namepath.slice(0, namepath.length - 1).join('/');
      let matches = leaf.match(/^(\D*)_(\d+)$/);

      let prefix;
      let id;
      let suffix = '';
      if (matches) {         // if found '<number>' in the name, assign id.
        prefix = matches[1]; // the front non-numeric characters
        id = matches[2]; // the digits
      } else {  // for node without '_<number>', make them zero-th items.
        prefix = isGroup ? leaf.substr(0, leaf.length - 1) : leaf;
        id = 0;
        suffix = isGroup ? '*' : '';
      }
      let seriesName = getSeriesNodeName(prefix, suffix, parent);
      candidatesDict[seriesName] = candidatesDict[seriesName] || [];
      let seriesNode = createSeriesNode(prefix, suffix, parent, +id, name);
      candidatesDict[seriesName].push(seriesNode);
    });

    // In each group of nodes, group nodes in bunches that have monotonically
    // increasing numbers in their names.  Each of these bunches is a series.
    _.each(candidatesDict, function (seriesInfoArray: SeriesNode[], seriesName) {
      if (seriesInfoArray.length < 2) {
        return;
      }
      seriesInfoArray.sort(function (a, b) {
        return (+a.clusterId) - (+b.clusterId);
      });

      // Loop through the nodes sorted by its detected series number, grouping
      // all nodes with monotonically-increasing series numbers.
      let seriesNodes = [seriesInfoArray[0]];
      for (let index = 1; index < seriesInfoArray.length; index++) {
        let nextNode = seriesInfoArray[index];
        if (nextNode.clusterId === seriesNodes[seriesNodes.length - 1].clusterId
          + 1) {
          seriesNodes.push(nextNode);
          continue;
        }
        addSeriesToDict(seriesNodes, seriesDict, +clusterId, metagraph);
        seriesNodes = [nextNode];
      }
      addSeriesToDict(seriesNodes, seriesDict, +clusterId, metagraph);
    });
  });
  return seriesDict;
}


export function build(graph: SlimGraph, params: HierarchyParams): Hierarchy | void {
  let h = new HierarchyImpl();
  let seriesNames: { [name: string]: string } = {};
  // Get all the possible device and XLA cluster names.
  let deviceNames = {};
  let xlaClusterNames = {};
  _.each(graph.nodes, (node, nodeName) => {
    if (node.device) {
      deviceNames[node.device] = true;
    }

    if (node.xlaCluster) {
      xlaClusterNames[node.xlaCluster] = true;
    }
  });

  h.devices = _.keys(deviceNames);
  h.xlaClusters = _.keys(xlaClusterNames);

  addNodes(h, graph);

  if (params.seriesNodeMinSize > 0) {
    groupSeries(
      h.root, h, seriesNames, params.seriesNodeMinSize,
      params.seriesMap);
  }
  addEdges(h, graph, seriesNames);
  h.templates = detect(h, params.verifyTemplate);
  return h;
};