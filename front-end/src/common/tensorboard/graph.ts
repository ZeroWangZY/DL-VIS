import * as graphlib from 'graphlib'
import { Hierarchy } from './hierarchy'
const _ = require('lodash')

export const NAMESPACE_DELIM = '/';
export const ROOT_NAME = '__root__';
export const FUNCTION_LIBRARY_NODE = '__function_library__';
/** Attribute key used for storing attributes that are too large. */
export const LARGE_ATTRS_KEY = '_too_large_attrs';
/**
 * Maximum allowed size in bytes, before the attribute is considered large
 * and filtered out of the graph.
 */
export const LIMIT_ATTR_SIZE = 1024;

// Separator between the source and the destination name of the edge.
export const EDGE_KEY_DELIM = '--';

export enum GraphType {
  FULL, EMBEDDED, META, SERIES, CORE, SHADOW, BRIDGE,
  EDGE
};
export enum NodeType { META, OP, SERIES, BRIDGE, ELLIPSIS };

/** Indicates if a node is to be included in the main graph when rendered. */
export enum InclusionType { INCLUDE, EXCLUDE, UNSPECIFIED };

/** Indicates if a series is to be grouped in the graph when rendered. */
export enum SeriesGroupingType { GROUP, UNGROUP };
const OUTPUT_SHAPES_KEY = '_output_shapes';

/** Attribute key reserved for the XLA cluster that an op runs on. */
const _XLA_CLUSTER_KEY = '_XlaCluster';

export interface NodeDef {
  /** Name of the node */
  name: string;
  /** List of nodes that are inputs for this node. */
  input: string[];
  /** The name of the device where the computation will run. */
  device: string;
  /** The name of the operation associated with this node. */
  op: string;
  /** List of attributes that describe/modify the operation. */
  attr: { key: string; value: Record<string, any> }[];
}

export interface Node {
  /** The name of the node, used frequently to look up nodes by name. */
  name: string;
  /** Which type of node this is. */
  type: NodeType;
  /**
   * Whether this node is a type that may contain other nodes. Those types
   * should extend from GroupNode.
   *
   * For an OpNode, isGroupNode will be false, even though it may have
   * embeddings. These embedding Nodes will have their parentNode set to the
   * OpNode. However, embeddings are later rendered as annotations, not as
   * children to be made visible on expansion (like a Metanode or SeriesNode).
   */
  isGroupNode: boolean;
  /**
   * The number of nodes this node represents. For OpNodes, this will be 1, and
   * for GroupNodes it will be a count of the total number of descendents it
   * contains.
   */
  cardinality: number;
  /**
   * The Node which is this Node's parent. This is of type Node and not
   * GroupNode because of embeddings, which will have a parent OpNode.
   */
  parentNode: Node;
  /** Runtime execution stats for this node, if available */
  stats: NodeStats;
  /** If the node is to be included or excluded from the main graph when
   *  rendered. Defaults to UNSPECIFIED, which means that the rendering
   *  algorithm determines if it will be included or not. Then can be set to
   *  INCLUDE or EXCLUDE manually by the user.
   */
  include: InclusionType;
  /**
   * Node attributes specify customizable visual aspects of a node and
   * application-specific metadata associated with a node. The name
   * 'nodeAttributes' is meant to avoid naming-conflicts with the 'attr' in
   * subclasses of Node.
   */
  nodeAttributes: { [key: string]: any };
}

export function getIncludeNodeButtonString(include: InclusionType) {
  if (include === InclusionType.EXCLUDE) {
    return 'Add to main graph';
  } else {
    return 'Remove from main graph';
  }
};

export function getGroupSeriesNodeButtonString(group: SeriesGroupingType) {
  if (group === SeriesGroupingType.GROUP) {
    return 'Ungroup this series of nodes';
  } else {
    return 'Group this series of nodes';
  }
};

export interface VersionDef {
  // The version of the code that produced this data.
  producer: number;

  // Any consumer below this version is not allowed to consume this data.
  min_consumer: number;

  // Specific consumer versions which are disallowed (e.g. due to bugs).
  bad_consumers: number[];
};

export interface ArgDef {
  name: string;
  type: string;
};

export interface OpDef {
  name: string;
  input_arg: ArgDef[];
  output_arg: ArgDef[];
};

export interface FunctionDef {
  // The definition of the function's name, arguments, return values,
  // attrs etc.
  signature: OpDef;

  // A list of nodes in the function.
  node_def: NodeDef[];
};

/**
 * Describes a library of functions that may be composed throughout the graph.
 */
export interface FunctionDefLibraryDef {
  // A list of functions.
  function: FunctionDef[];
};

export interface GraphDef {
  // A list of nodes in the graph.
  node: NodeDef[];

  // Compatibility versions of the graph.
  versions: VersionDef[];

  // Contains a library of functions that may composed through the graph.
  library: FunctionDefLibraryDef;
};

export interface BuildParams {
  enableEmbedding: boolean;
  inEmbeddingTypes: string[];
  outEmbeddingTypes: string[];
  refEdges: { [inputEdge: string]: boolean };
}
export type TensorShape = number[];
export interface NormalizedInput {
  name: string;
  /** The index of the output tensor of the source node. */
  outputTensorKey: string;
  isControlDependency: boolean;
}
export interface OpNode extends Node {
  name: string;
  op: string;
  // The device on which the op ran. Null if it is unknown.
  device: string;
  attr: { key: string; value: any }[];
  inputs: NormalizedInput[];
  inEmbeddings: OpNode[];
  outEmbeddings: OpNode[];
  // The name of the SeriesNode that can contain this node in its series.
  // If there is no such node, then this is null.
  owningSeries: string;
  /**
   * Object mapping output channel string to tensor shapes. The output channel
   * is a string rather than a number because within TensorFlow functions, an
   * output may be a cross between an output variable and a number (combined
   * with a colon) such as "foo:2" rather than just a number alone.
   *
   * Each tensor shape is an array of numbers, or null. Details:
   * - null means unknown rank, and therefore entire shape is unknown.
   * - [4, 2, 1] means rank-3 tensor of size 4x2x1.
   * - [] means a scalar (rank-0 tensor).
   * - [1] means rank-1 tensor of size 1 (not the same as scalar).
   * - [5, -1, 3] means rank-3 tensor of shape is 5x?x3. The size
   *       of the middle dimension is unknown (encoded as -1).
   */
  outputShapes: { [key: string]: TensorShape };

  // The XLA Cluster on which the op ran. Null if it is unknown.
  xlaCluster: string;

  // Whether op is compatible with its assigned device.  Currently, if an op
  // is not specified a device, the device is defaulted to the TPU.
  // Furthermore, all ops are considered compatible for CPU and GPU devices,
  // while a whitelist of compatible ops are specifed for the TPU.
  // Reference: opValid func in op.ts.
  compatible: boolean;

  // This field is only defined if the op node represents an input_arg to a
  // library function. It is the index of the input_arg.
  functionInputIndex: number | undefined;

  // This field is only defined if the op node represents an output_arg of a
  // library function. It is the index of the output_arg.
  functionOutputIndex: number | undefined;
}
export interface BridgeNode extends Node {
  /**
   * Whether this bridge node represents edges coming into its parent node.
   */
  inbound: boolean;
}

export interface EllipsisNode extends Node {
  /**
   * The number of nodes this ellipsis represents.
   */
  numMoreNodes: number;

  /**
   * Sets the number of nodes this ellipsis represents and changes the node
   * name accordingly.
   */
  setNumMoreNodes(numNodes: number);
}

export interface BaseEdge extends graphlib.EdgeObject {
  isControlDependency: boolean;
  isReferenceEdge: boolean;
  /** The index of the output tensor of the source node. */
  outputTensorKey: string;
}

export interface Metaedge extends graphlib.EdgeObject {

  /**
   * Stores the original BaseEdges represented by this Metaedge.
   */
  baseEdgeList: BaseEdge[];

  /**
   * Whether this edge represents a relationship that is inbound (or outbound)
   * to the object which contains this information. For example, in a Metanode's
   * bridgegraph, each edge connects an immediate child to something outside
   * the Metanode. If the destination of the edge is inside the Metanode, then
   * its inbound property should be true. If the destination is outside the
   * Metanode, then its inbound property should be false.
   *
   * The property is optional because not all edges can be described as
   * inbound/outbound. For example, in a Metanode's metagraph, all of the edges
   * connect immediate children of the Metanode. None should have an inbound
   * property, or they should be null/undefined.
   */
  inbound?: boolean;

  /**
   * Number of regular edges (not control dependency edges).
   */
  numRegularEdges: number;

  /**
   * Number of control dependency edges.
   */
  numControlEdges: number;

  /**
   * Number of reference edges, which is an edge to an operation
   * that takes a reference to its input and changes its value.
   */
  numRefEdges: number;

  /**
   * Total size (number of units) of all the tensors flowing through this edge.
   */
  totalSize: number;

  addBaseEdge(edge: BaseEdge, h: Hierarchy): void;
}

export interface GroupNode extends Node {

  metagraph: graphlib.Graph<GroupNode | OpNode, Metaedge>;

  bridgegraph: graphlib.Graph<GroupNode | OpNode, Metaedge>;

  deviceHistogram: { [device: string]: number };

  compatibilityHistogram: { compatible: number, incompatible: number }

  hasNonControlEdges: boolean;
}
export interface Metanode extends GroupNode {
  depth: number;
  templateId: string;
  opHistogram: { [op: string]: number };
  getFirstChild(): GroupNode | OpNode;
  getRootOp(): OpNode;
  /** Return name of all leaves inside a metanode. */
  leaves(): string[];
}

export class MetanodeImpl implements Metanode {
  name: string;
  stats: NodeStats;
  type: NodeType;
  depth: number;
  isGroupNode: boolean;
  cardinality: number;
  metagraph: graphlib.Graph<GroupNode | OpNode, Metaedge>;
  bridgegraph: graphlib.Graph<GroupNode | OpNode, Metaedge>;
  templateId: string;
  opHistogram: { [op: string]: number };
  deviceHistogram: { [op: string]: number };
  compatibilityHistogram: { compatible: number, incompatible: number };
  parentNode: Node;
  hasNonControlEdges: boolean;
  include: InclusionType;
  nodeAttributes: { [key: string]: any; };

  /** A label object for meta-nodes in the graph hierarchy */
  constructor(name: string, opt = {}) {
    this.name = name;
    this.type = NodeType.META;
    /** number of levels under this group */
    this.depth = 1;
    this.isGroupNode = true;
    /** # of leaf nodes (including embedded ones) */
    this.cardinality = 0;
    /** graph contains metanodes, nodes, edges
     * and metaedges for main items within this metanode
     */
    this.metagraph =
      createGraph<GroupNode | OpNode, Metaedge>(name, GraphType.META, opt);
    /** bridgegraph must be constructed lazily-see hierarchy.getBridgegraph() */
    this.bridgegraph = null;
    /**
     * A dictionary that count ops type of nodes in this metanode
     * (op type => count).
     */
    this.opHistogram = {};
    this.deviceHistogram = {};
    this.compatibilityHistogram = { compatible: 0, incompatible: 0 };
    /** unique id for a metanode of similar subgraph */
    this.templateId = null;
    /** Metanode which contains this node, if any */
    this.parentNode = null;
    this.hasNonControlEdges = false;
    this.include = InclusionType.UNSPECIFIED;
  }

  getFirstChild(): GroupNode | OpNode {
    return this.metagraph.node(this.metagraph.nodes()[0]);
  }

  /**
   * Returns the op node associated with the metanode.
   * For example, if the metanode is 'sgd', the associated
   * op node is sgd/(sgd).
   */
  getRootOp(): OpNode {
    let nameSplit = this.name.split('/');
    let rootOpName = this.name + '/(' + nameSplit[nameSplit.length - 1] + ')';
    return <OpNode>this.metagraph.node(rootOpName);
  }

  /**
   * Return an array of the names of all the leaves (non-GroupNodes) inside
   * this metanode. This performs a breadth-first search of the tree, so
   * immediate child leaves will appear earlier in the output array than
   * descendant leaves.
   */
  leaves(): string[] {
    let leaves = [];
    let queue = [<Node>this];
    let metagraph; // Defined here due to a limitation of ES6->5 compilation.
    while (queue.length) {
      let node = queue.shift();
      if (node.isGroupNode) {
        metagraph = (<GroupNode>node).metagraph;
        _.each(metagraph.nodes(), name => queue.push(metagraph.node(name)));
      } else {
        leaves.push(node.name);
      }
    }
    return leaves;
  }
};
export class EllipsisNodeImpl implements EllipsisNode {
  name: string;
  numMoreNodes: number;
  stats: NodeStats;
  type: NodeType;
  isGroupNode: boolean;
  cardinality: number;
  parentNode: Node;
  include: InclusionType;
  nodeAttributes: { [key: string]: any; };
  /**
   * Constructs a new ellipsis annotation node.
   *
   * @param numNodes The number of additional annotations this node represents.
   */
  constructor(numNodes: number) {
    this.type = NodeType.ELLIPSIS;
    this.isGroupNode = false;
    this.cardinality = 1;
    this.parentNode = null;
    this.stats = null;
    this.setNumMoreNodes(numNodes);
    this.include = InclusionType.UNSPECIFIED;
  }

  setNumMoreNodes(numNodes: number) {
    this.numMoreNodes = numNodes;
    this.name = '... ' + numNodes + ' more';
  }
};
export class SlimGraph {
  nodes: { [nodeName: string]: OpNode };
  edges: BaseEdge[];

  constructor() {
    this.nodes = {};
    this.edges = [];
  }
}

function getEmbedPredicate(types: string[]) {
  return function (node: OpNode) {
    // check types
    for (let i = 0; i < types.length; i++) {
      let regExp = new RegExp(types[i]);
      if (node.op.match(regExp)) { return true; }
    }
    return false;
  };
};

export class NodeStats {
  constructor(outputSize: number[][]) { this.outputSize = outputSize; }

  /**
   * Add the start and end time for a particular kernel execution of this op.
   * Ops can have multiple kernel executions within the same session run.
   */
  addExecutionTime(startTime: any, endTime: any) {
    if (this.startTime != null) {
      this.startTime = Math.min(this.startTime, startTime);
    } else {
      this.startTime = startTime;
    }
    if (this.endTime != null) {
      this.endTime = Math.max(this.endTime, endTime);
    } else {
      this.endTime = endTime;
    }
  }

  /**
   * Add the bytes allocated for a particular kernel execution of this op.
   * Ops can have multiple kernel executions within the same session run.
   */
  addBytesAllocation(totalBytes: number): void {
    if (this.totalBytes != null) {
      this.totalBytes = Math.max(this.totalBytes, totalBytes);
    } else {
      this.totalBytes = totalBytes;
    }
  }

  /**
   * Absolute start time for the very first kernel execution of this op.
   */
  startTime: number | null | undefined;
  /**
   * Absolute end time for the very last kernel execution of this op.
   */
  endTime: number | null | undefined;
  /**
   * Total number of bytes used for the node. Sum of all children
   * if it is a Group node.
   */
  totalBytes = 0;

  /**
   * The shape of each output tensors, if there are any.
   * Empty if it is a Group node.
   */
  outputSize: number[][];

  /**
   * Combines the specified stats with the current stats.
   * Modifies the current object. This method is used to
   * compute aggregate stats for group nodes.
   */
  combine(stats: NodeStats): void {
    if (stats.totalBytes != null) {
      this.totalBytes += stats.totalBytes;
    }
    if (stats.getTotalMicros() != null) {
      this.addExecutionTime(stats.startTime, stats.endTime);
    }
  }

  /**
   * Total number of compute time in microseconds used for the node.
   * Sum of all children if it is a Group node. Null if it is unknown.
   * This method can not be scaffolded under a getter attribute because
   * ECMAScript 5 does not support getter attributes.
   */
  getTotalMicros(): number | null | undefined {
    if (this.startTime == null || this.endTime == null) {
      return null;
    }
    return this.endTime - this.startTime;
  }
}

export function createMetanode(name: string, opt = {}): Metanode {
  return new MetanodeImpl(name, opt);
}

function normalizeInputs(inputs: string[]): NormalizedInput[] {
  let normalizedInputs: NormalizedInput[] = [];
  _.each(inputs, (inputName: any) => {
    let isControlDependency = inputName[0] === '^';
    if (isControlDependency) {
      // The carat merely indicates whether this input is a control dependency.
      // It should not be part of the name.
      inputName = inputName.substring(1);
    }

    let name = inputName;
    let outputTensorKey = '0';

    let match = inputName.match(/(.*):(\w+:\d+)$/);
    if (match) {
      // The output string consists of several characters and a number separated
      // by a colon.
      name = match[1];
      outputTensorKey = match[2];
    } else {
      match = inputName.match(/(.*):(\d+)$/);
      if (match) {
        // The output string consists of a single number.
        name = match[1];
        outputTensorKey = match[2];
      }
    }

    if (normalizedInputs.length === 0 ||
      name !== normalizedInputs[normalizedInputs.length - 1].name) {
      normalizedInputs.push({
        name: name,
        outputTensorKey: outputTensorKey,
        isControlDependency: isControlDependency,
      });
    }
  });
  return normalizedInputs;
}

function extractOutputShapes(attr: Array<{ key: string, value: any }>): { [key: string]: TensorShape } | null {
  let result = null;
  // We don't know anything about the output tensors.
  if (!attr) {
    return null;
  }
  for (let i = 0; i < attr.length; i++) {
    let { key, value } = attr[i];
    if (key === OUTPUT_SHAPES_KEY) {
      if (!value.list.shape) {
        // The OUTPUT_SHAPES_KEY lacks a value. We know nothing about the shape.
        return null;
      }

      // Map all output tensors into array of numbers denoting their shape.
      let result = value.list.shape.map((shape: any) => {
        if (shape.unknown_rank) {
          // This output tensor is of unknown rank. We don't know if it is a
          // scalar, or a tensor, or of what shape it is.
          return null;
        }
        if (shape.dim == null ||
          (shape.dim.length === 1 && shape.dim[0].size == null)) {
          // This output tensor is a scalar.
          return [];
        }
        // This output tensor has a known rank. Map each dimension size
        // into a number.
        return shape.dim.map((dim: any) => {
          // Size can be -1 if this particular dimension is unknown.
          return dim.size;
        });
      });
      // Since we already processed it, remove the entry from the attribute
      // list (saves memory).
      attr.splice(i, 1);
      return result;
    }
  }
  // We didn't find OUTPUT_SHAPES_KEY in attributes, so we don't know anything
  // about the output tensors.
  return null;
}

function extractXlaCluster(attr: Array<{ key: string, value: any }>): string |
  null {
  if (!attr) {
    return null;
  }

  // Find the attribute for XLA cluster if there is one.
  for (let i = 0; i < attr.length; i++) {
    if (attr[i].key === _XLA_CLUSTER_KEY) {
      return attr[i].value['s'] || null;
    }
  }
  return null;
}

export function getStrictName(name: string): string {
  let parts = name.split(NAMESPACE_DELIM);
  return name + NAMESPACE_DELIM + '(' + parts[parts.length - 1] + ')';
}

function addEdgeToGraph(
  graph: SlimGraph, inputName: string, outputNode: OpNode,
  input: NormalizedInput, params: BuildParams, index: number) {
  // Don't allow loops in the graph.
  if (inputName === outputNode.name) {
    return;
  }
  // Check if this op type and input number corresponds to a
  // reference edge using the refEdges dictionary in the params.
  let isRefEdge = params.refEdges[outputNode.op + ' ' + index] === true;
  graph.edges.push({
    v: inputName,
    w: outputNode.name,
    outputTensorKey: input.outputTensorKey,
    isControlDependency: input.isControlDependency,
    isReferenceEdge: isRefEdge
  });
}

export class OpNodeImpl implements OpNode {
  name: string;
  op: string;
  device: string;
  stats: NodeStats;
  attr: { key: string, value: any }[];
  inputs: NormalizedInput[];
  type: NodeType;
  isGroupNode: boolean;
  cardinality: number;
  inEmbeddings: OpNode[];
  outEmbeddings: OpNode[];
  parentNode: Node;
  include: InclusionType;
  owningSeries: string;
  outputShapes: { [key: string]: TensorShape; };
  nodeAttributes: { [key: string]: any; };
  xlaCluster: string;
  compatible: boolean;

  // This field is only defined if the op node represents an input_arg to a
  // library function. It is the index of the input_arg.
  functionInputIndex: number;

  // This field is only defined if the op node represents an output_arg of a
  // library function. It is the index of the output_arg.
  functionOutputIndex: number;

  /**
   * Constructs a new Op node.
   *
   * @param rawNode The raw node.
   */
  constructor(rawNode: NodeDef) {
    this.op = rawNode.op;
    this.name = rawNode.name;
    this.device = rawNode.device;
    this.attr = rawNode.attr;
    // An array of normalized inputs that denote the incoming edges to
    // the current node. Each input contains the normalized name of the
    // source node, whether it has a number part and whether it is a
    // control dependency.
    this.inputs = normalizeInputs(rawNode.input);
    this.outputShapes = extractOutputShapes(rawNode.attr);
    this.xlaCluster = extractXlaCluster(rawNode.attr);
    this.compatible = false;
    // additional properties
    this.type = NodeType.OP;
    this.isGroupNode = false;
    this.cardinality = 1;
    this.inEmbeddings = [];
    this.outEmbeddings = [];
    this.parentNode = null;
    this.include = InclusionType.UNSPECIFIED;
    this.owningSeries = null;
  }
};

export function createGraph<N, E>(name: string, type, opt = {}):
  graphlib.Graph<N, E> {
  let graph = new graphlib.Graph<N, E>(opt);
  graph.setGraph({
    name: name,
    rankdir: 'BT',  // BT,TB,LR,RL
    type: type
  });
  return graph;
};

export function getHierarchicalPath(name: string,
  seriesNames?: { [name: string]: string }): string[] {
  let path: string[] = [];
  let i = name.indexOf(NAMESPACE_DELIM);
  // Push all parent portions of the path.
  while (i >= 0) {
    path.push(name.substring(0, i));
    i = name.indexOf(NAMESPACE_DELIM, i + 1);
  }
  // If the node's path is under a series, then add the series node name to the
  // hierarchical path as the parent of the leaf.
  if (seriesNames) {
    let seriesName = seriesNames[name];
    if (seriesName) {
      path.push(seriesName);
    }
  }
  // Push the leaf of the path.
  path.push(name);
  return path;
};

function mapStrictHierarchy(nodeNames: string[],
  embeddingNodeNames: string[]): { [oldName: string]: string } {
  /** Dictionary that maps the old new to the new name */
  let newNameDictionary: { [oldName: string]: string } = {};
  /** Set used to store all namespaces. */
  let namespaceSet: { [namespace: string]: boolean } = {};
  // sort the nodes to make prefix check faster
  nodeNames.sort();
  // look for nodes with a prefix a,a/b -> a/(a),a/b
  for (let i = 0; i < nodeNames.length - 1; ++i) {
    let a = nodeNames[i];
    // Get all the parent namespaces of the current node
    // and add them in the namespace set.
    _.each(getHierarchicalPath(a).slice(0, -1), ns => {
      namespaceSet[ns] = true;
    });
    for (let j = i + 1; j < nodeNames.length; ++j) {
      let b = nodeNames[j];
      if (_.startsWith(b, a)) {
        if (b.length > a.length && b.charAt(a.length) === NAMESPACE_DELIM) {
          newNameDictionary[a] = getStrictName(a);
          break;
        }
      } else {
        break;
      }
    }
  }
  // Go through all the embedding node names and rename them in case they
  // collide with namespaces.
  _.each(embeddingNodeNames, embeddingName => {
    if (embeddingName in namespaceSet) {
      // Rename to follow strict hierarchy.
      newNameDictionary[embeddingName] = getStrictName(embeddingName);
    }
  });
  return newNameDictionary;
};

export function build(
  graphDef: GraphDef): SlimGraph | void {
  let refEdges: Record<string, boolean> = {};
  refEdges["Assign 0"] = true;
  refEdges["AssignAdd 0"] = true;
  refEdges["AssignSub 0"] = true;
  refEdges["assign 0"] = true;
  refEdges["assign_add 0"] = true;
  refEdges["assign_sub 0"] = true;
  refEdges["count_up_to 0"] = true;
  refEdges["ScatterAdd 0"] = true;
  refEdges["ScatterSub 0"] = true;
  refEdges["ScatterUpdate 0"] = true;
  refEdges["scatter_add 0"] = true;
  refEdges["scatter_sub 0"] = true;
  refEdges["scatter_update 0"] = true;
  let params = {
    enableEmbedding: true,
    inEmbeddingTypes: ["Const"],
    outEmbeddingTypes: ["^[a-zA-Z]+Summary$"],
    refEdges: refEdges
  };
  /**
   * A dictionary that maps each in-embedding node name to the node
   * object.
   */
  let inEmbedding: { [nodeName: string]: OpNode } = {};
  /**
   * A dictionary that maps each out-embedding node name to the node
   * object.
   */
  let outEmbedding: { [nodeName: string]: OpNode } = {};
  /**
   * A dictionary that maps each node name to an array of the node's
   * out-embedding node label objects.
   */
  let outEmbeddings: { [inputName: string]: OpNode[] } = {};
  let isInEmbeddedPred = getEmbedPredicate(params.inEmbeddingTypes);
  let isOutEmbeddedPred = getEmbedPredicate(params.outEmbeddingTypes);
  let embeddingNodeNames: string[] = [];
  let rawNodes = graphDef.node;
  /**
   * A list of all the non-embedding node names which appear in the processed
   * list of raw nodes. Here we pre-allocate enough room for all the rawNodes,
   * even though there will some number of embeddings. The excess array length
   * is spliced off later.
   *
   * Experimentation shows that around 30% of the array will go unused, and
   * even for very large networks that amounts to less than 10k spaces.
   */
  let nodeNames = new Array<string>(rawNodes.length);
  let opNodes = new Array<OpNode>(rawNodes.length);
  let index = 0;




  const processRawNode = (rawNode: any) => {
    let opNode = new OpNodeImpl(rawNode);
    if (isInEmbeddedPred(opNode)) {
      embeddingNodeNames.push(opNode.name);
      inEmbedding[opNode.name] = opNode;
      return opNode;
    }

    if (isOutEmbeddedPred(opNode)) {
      embeddingNodeNames.push(opNode.name);
      outEmbedding[opNode.name] = opNode;
      _.each(opNode.inputs, (input: any) => {
        let inputName = input.name;
        outEmbeddings[inputName] = outEmbeddings[inputName] || [];
        outEmbeddings[inputName].push(opNode);
      });
      return opNode;
    }
    // The node is not an embedding, so add it to the names and nodes
    // lists.
    opNodes[index] = opNode;
    nodeNames[index] = opNode.name;
    index++;
    return opNode;
  };

  _.each(rawNodes, processRawNode);

  const processFunction = (func: FunctionDef) => {
    // Give the function itself a node.
    const functionNodeName =
      FUNCTION_LIBRARY_NODE + NAMESPACE_DELIM + func.signature.name;
    // Create an op node for the function. Mark it as part of a
    // function library.
    processRawNode({
      name: functionNodeName,
      input: [],
      device: '',
      op: '',
      attr: [],
    });

    // If the function has inputs, make nodes out of them.
    if (func.signature.input_arg) {
      // Makes an OpNode out of either an input_arg of a library
      // function.
      let currentInputIndex = 0;
      const processInput = (arg) => {
        const opNode = processRawNode({
          name: functionNodeName + NAMESPACE_DELIM + arg.name,
          input: [],
          device: '',
          op: 'input_arg',
          attr: [{
            key: 'T',
            value: {
              type: arg.type,
            },
          }],
        });
        opNode.functionInputIndex = currentInputIndex;
        currentInputIndex++;
      };

      // Make nodes for input args of the function. Unfortunately, the
      // pbtxt configuration language is not rich enough to
      // differentiate between an array with 1 item vs 1 object
      // property.
      if (func.signature.input_arg['name']) {
        // There is only 1 input arg.
        processInput(func.signature.input_arg);
      } else {
        // There are several input args.
        _.each(func.signature.input_arg, processInput);
      }
    }

    // Make nodes for output args of the function. Track the names of
    // output args within the keys of this object. Unlike the
    // input_args, the output_args are already defined within the
    // node_defs of the library function.
    let currentOutputIndex = 0;
    const outputArgNames = {};

    // If the function has outputs, make nodes out of them.
    if (func.signature.output_arg) {
      const processOutput = arg => {
        outputArgNames[
          functionNodeName + NAMESPACE_DELIM + arg.name] =
          currentOutputIndex;
        currentOutputIndex++;
      };
      if (func.signature.output_arg['name']) {
        // There is only 1 output arg.
        processOutput(func.signature.output_arg);
      } else {
        // There are several output args.
        _.each(func.signature.output_arg, processOutput);
      }
    }

    _.each(func.node_def, rawNode => {
      // Prefix with the name of the function so that the graph
      // correctly computes the hierarchy (and makes metanodes).
      rawNode.name = functionNodeName + '/' + rawNode.name;
      if (typeof rawNode.input === 'string') {
        rawNode.input = [rawNode.input];
      }
      const opNode = processRawNode(rawNode);
      if (_.isNumber(outputArgNames[rawNode.name])) {
        // Mark the node as one of the outputs of the function.
        opNode.functionOutputIndex = outputArgNames[rawNode.name];
      }

      _.each(opNode.inputs, normalizedInput => {
        normalizedInput.name =
          functionNodeName + NAMESPACE_DELIM + normalizedInput.name;
      });
    });
  };

  if (graphDef.library && graphDef.library.function) {
    // This graph contains functions.
    _.each(graphDef.library.function, processFunction);
  }

  opNodes.splice(index);
  nodeNames.splice(index);

  let normalizedNameDict =
    mapStrictHierarchy(nodeNames, embeddingNodeNames);
  let graph = new SlimGraph;

  // Add the nodes to the graph.
  _.each(opNodes, opNode => {
    let normalizedName =
      normalizedNameDict[opNode.name] || opNode.name;
    graph.nodes[normalizedName] = opNode;
    // Check if the node has out-embeddings. If yes, add them to the
    // node.
    if (opNode.name in outEmbeddings) {
      opNode.outEmbeddings = outEmbeddings[opNode.name];
      // Normalize the names of the out-embeddings.
      _.each(opNode.outEmbeddings, node => {
        node.name = normalizedNameDict[node.name] || node.name;
      });
    }
    // Update the name of the node.
    opNode.name = normalizedName;
  });

  // Visit each node's inputs to add the edges to the graph. If the
  // input
  // is an in-embedding, then add it to the node's in-embeddings
  // instead.
  _.each(opNodes, opNode => {
    _.each(opNode.inputs, (input, i) => {
      let inputName = input.name;
      if (inputName in inEmbedding) {
        let inEmbedNode = inEmbedding[inputName];
        opNode.inEmbeddings.push(inEmbedNode);
        // Move the inputs of the in-embedding node into incoming
        // edges of
        // the main node. E.g. the control dependency of a constant
        // node
        // should be moved to the op node where the constant is
        // embedded.
        for (let embedInput of inEmbedNode.inputs) {
          addEdgeToGraph(
            graph, normalizedNameDict[embedInput.name] ||
          embedInput.name,
            opNode, embedInput, params, i);
        }
      } else if (inputName in outEmbedding) {
        // Move the inputs of the out-embedding node into inputs of
        // the main node where the out-embedding points to.
        let outEmbedNode = outEmbedding[inputName];
        for (let embedInput of outEmbedNode.inputs) {
          addEdgeToGraph(
            graph, normalizedNameDict[embedInput.name] ||
          embedInput.name,
            opNode, input, params, i);
        }
      } else {
        addEdgeToGraph(
          graph, normalizedNameDict[inputName] || inputName,
          opNode, input, params, i);
      }
    });
  });

  // Normalize the names of in-embeddings.
  _.each(inEmbedding, (node, name) => {
    node.name = normalizedNameDict[node.name] || node.name;
  });

  return graph;
};

export class MetaedgeImpl implements Metaedge {
  v: string;
  w: string;
  baseEdgeList: BaseEdge[];
  inbound: boolean;
  numRegularEdges: number;
  numControlEdges: number;
  numRefEdges: number;
  totalSize: number;

  constructor(v: string, w: string) {
    this.v = v;
    this.w = w;
    this.baseEdgeList = [];
    this.inbound = null;
    this.numRegularEdges = 0;
    this.numControlEdges = 0;
    this.numRefEdges = 0;
    this.totalSize = 0;
  }

  addBaseEdge(edge: BaseEdge, h: Hierarchy): void {
    this.baseEdgeList.push(edge);
    if (edge.isControlDependency) {
      this.numControlEdges += 1;
    } else {
      this.numRegularEdges += 1;
    }
    if (edge.isReferenceEdge) {
      this.numRefEdges += 1;
    }
    // Compute the size of the tensor flowing through this
    // base edge.
    this.totalSize += MetaedgeImpl.computeSizeOfEdge(edge, h);
    h.maxMetaEdgeSize = Math.max(h.maxMetaEdgeSize, this.totalSize);
  }

  private static computeSizeOfEdge(edge: BaseEdge, h: Hierarchy):
    number {
    let opNode = <OpNode>h.node(edge.v);
    if (!opNode.outputShapes) {
      // No shape information. Asssume a single number. This gives
      // a lower bound for the total size.
      return 1;
    }
    h.hasShapeInfo = true;

    // Sum the sizes of all output tensors.
    return _(opNode.outputShapes).mapValues((shape: number[]) => {
      // If the shape is unknown, treat it as 1 when computing
      // total size. This gives a lower bound for the total size.
      if (shape == null) {
        return 1;
      }
      // Multiply all shapes to get the total size of the tensor.
      // E.g. The total size of [4, 2, 1] is 4 * 2 * 1.
      return _(shape).reduce((accumulated, currSize) => {
        // If this particular dimension is unknown, treat
        // it as 1 when computing total size. This gives a lower bound
        // for the total size.
        if (currSize === -1) {
          currSize = 1;
        }
        return accumulated * currSize;
      }, 1);
    }).sum();
  }
}

export function createMetaedge(v: string, w: string): Metaedge {
  return new MetaedgeImpl(v, w);
}

export interface SeriesNode extends GroupNode {
  hasLoop: boolean;
  prefix: string;
  suffix: string;
  clusterId: number;
  ids: number[];
  parent: string;
}
class SeriesNodeImpl implements SeriesNode {
  name: string;
  type: NodeType;
  stats: NodeStats;
  hasLoop: boolean;
  prefix: string;
  suffix: string;
  clusterId: number;
  ids: number[];
  parent: string;
  isGroupNode: boolean;
  cardinality: number;
  metagraph: graphlib.Graph<GroupNode | OpNode, Metaedge>;
  bridgegraph: graphlib.Graph<GroupNode | OpNode, Metaedge>;
  parentNode: Node;
  deviceHistogram: { [op: string]: number };
  compatibilityHistogram: { compatible: number, incompatible: number };
  hasNonControlEdges: boolean;
  include: InclusionType;
  nodeAttributes: { [key: string]: any; };

  constructor(prefix: string, suffix: string, parent: string,
    clusterId: number, name: string) {
    this.name = name || getSeriesNodeName(prefix, suffix, parent);
    this.type = NodeType.SERIES;
    this.hasLoop = false;
    this.prefix = prefix;
    this.suffix = suffix;
    this.clusterId = clusterId;
    this.ids = [];
    this.parent = parent;
    this.isGroupNode = true;
    this.cardinality = 0;
    this.metagraph = createGraph<Metanode, Metaedge>(name, GraphType.SERIES);
    // bridgegraph must be constructed lazily-see hierarchy.getBridgegraph()
    this.bridgegraph = null;
    this.parentNode = null;
    this.deviceHistogram = {};
    this.compatibilityHistogram = { compatible: 0, incompatible: 0 };
    this.hasNonControlEdges = false;
    this.include = InclusionType.UNSPECIFIED;
  }
}
export function createSeriesNode(prefix: string, suffix: string,
  parent: string, clusterId: number, name: string): SeriesNode {
  return new SeriesNodeImpl(prefix, suffix, parent, clusterId, name);
}

export function getSeriesNodeName(prefix: string, suffix: string,
  parent: string, startId?: number, endId?: number): string {
  let numRepresentation =
    (typeof startId !== 'undefined' && typeof endId !== 'undefined') ?
      '[' + startId + '-' + endId + ']' :
      '#';
  let pattern = prefix + numRepresentation + suffix;
  return (parent ? parent + '/' : '') + pattern;
}

function degreeSequence(graph: graphlib.Graph<any, any>): number[] {
  let degrees = graph.nodes().map(function (name) {
    return graph.neighbors(name).length;
  });
  degrees.sort();
  return degrees;
};

export function hasSimilarDegreeSequence(graph1: graphlib.Graph<any, any>,
  graph2: graphlib.Graph<any, any>): boolean {
  let dg1 = degreeSequence(graph1);
  let dg2 = degreeSequence(graph2);

  for (let i = 0; i < dg1.length; i++) {
    if (dg1[i] !== dg2[i]) {
      return false;
    }
  }
  return true;
};