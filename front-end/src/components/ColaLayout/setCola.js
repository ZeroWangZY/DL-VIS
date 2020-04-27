(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : factory((global.setcola = {}));
})(this, function (exports) {
  "use strict";

  let _sets;

  function computeSets(elements, definition, sets, index) {
    _sets = sets;
    let set = [];
    if (!definition) {
      set = [elements];
    } else if (definition.partition) {
      set = partitionSet(elements, definition);
    } else if (definition.collect) {
      set = collectSet(elements, definition);
    } else if (definition.expr) {
      set = exprSet(elements, definition, index);
      if (definition.name) set._setName = definition.name;
    } else if (typeof definition === "string") {
      set = existingSet(elements, definition);
      set._setName = definition;
    } else {
      definition.forEach(function (subdef, index) {
        set.push(computeSets(elements, subdef, _sets, index));
      });
    }
    return set;
  }
  function contains(list, value) {
    return list.indexOf(value) !== -1;
  }
  function partitionSet(elements, definition) {
    let partitionSets = {};

    // Split the elements into sets based on their partition property.
    elements.forEach(function (element) {
      let partitionValue = element[definition.partition];
      if (definition.partition === "parent" && partitionValue) {
        partitionValue = partitionValue._id;
      }
      if (definition.exclude && contains(definition.exclude, partitionValue))
        return;
      if (definition.include && !contains(definition.include, partitionValue))
        return;
      if (!partitionSets[partitionValue]) partitionSets[partitionValue] = [];
      partitionSets[partitionValue].push(element);
    });

    // Lift the partition property to a property of the set.
    Object.keys(partitionSets).forEach(function (setName) {
      partitionSets[setName][definition.partition] =
        partitionSets[setName][0][definition.partition];
    });

    return Object.keys(partitionSets).map(function (setName) {
      partitionSets[setName]._setName = setName;
      return partitionSets[setName];
    });
  }
  function collectSet(elements, definition) {
    let collectSets = {};
    elements.forEach(function (element) {
      let set = [];
      definition.collect.forEach(function (expr) {
        switch (expr) {
          case "node":
            set.push(element);
            break;
          case "node.firstchild":
            if (element.firstchild) set = set.concat(element.firstchild);
            break;
          case "node.sources":
            set = set.concat(element.getSources());
            break;
          case "node.targets":
            set = set.concat(element.getTargets());
            break;
          case "node.neighbors":
            set = set.concat(element.getNeighbors());
            break;
          default:
            if (expr.indexOf("sort") !== -1) {
              let children = element.getTargets();
              let map = children.map(function (el) {
                return el.value;
              });
              let sorted = map.sort();
              let first = children.filter(function (el) {
                return el.value === sorted[0];
              });
              if (first[0]) set = set.concat(first[0]);
            } else if (expr.indexOf("min") !== -1) {
              let source = expr.split(/\(|,|\)/g)[2];
              let property = expr.split(/\(|,|\)/g)[1].replace(/'/g, "");

              let node;
              switch (source) {
                case "node.children":
                  let children = element.getTargets();
                  let minimum = Math.min(
                    ...children.map(function (n) {
                      return n[property];
                    })
                  );
                  node = children.filter(function (n) {
                    return n[property] === minimum;
                  })[0];
                  if (!element[property]);
                  else if (node && node[property] < element[property]) {
                    node = null;
                  }
                  break;
                case "node.neighbors":
                  break;
                case "node.parents":
                  break;
                default:
                // Do nothing
              }
              if (node) {
                set = set.concat(node);
              }
            } else {
              console.error("Unknown collection parameter '" + expr + "'");
            }
        }
      });
      if (set.length > 1) collectSets[element._id] = set;
    });
    return Object.keys(collectSets).map(function (setName) {
      return collectSets[setName];
    });
  }
  function exprSet(elements, definition, index) {
    let set = [];
    elements.forEach(function (element) {
      let matches = definition.expr.match(/node\.[a-zA-Z.0-9]+/g);
      let expr = definition.expr;
      matches.forEach(function (match) {
        let props = match.replace("node.", "").split(".");
        let result;
        for (let i = 0; i < props.length; i++) {
          result = element[props[i]];
        }
        expr = expr.replace(match, JSON.stringify(result));
      });
      if (eval(expr)) set.push(element);
    });
    set._exprIndex = index;
    return set;
  }
  function existingSet(elements, definition) {
    return _sets[definition];
  }

  let _graphNodes, _graphLinks, _groups, _gap;

  function computeConstraints(
    elements,
    definition,
    cid,
    gap,
    graphNodes,
    graphLinks,
    graphGroups
  ) {
    _graphNodes = graphNodes;
    _graphLinks = graphLinks;
    _groups = graphGroups;
    _gap = gap;

    let results = [];
    let ID = cid + "_" + definition.constraint;
    switch (definition.constraint) {
      case "align":
        results = results.concat(alignment(elements, definition, ID));
        break;
      case "order":
        results = results.concat(orderElements(elements, definition, ID));
        break;
      case "position":
        results = results.concat(position(elements, definition, ID));
        break;
      case "circle":
        circle(elements, definition, ID);
        break;
      case "hull":
        hull(elements, definition, ID);
        break;
      case "cluster":
        cluster(elements, definition, ID);
        break;
      case "padding":
        padding(elements, definition, ID);
        break;
      default:
        console.error("Unknown constraint type '" + definition.type + "'");
    }
    return results;
  }
  /******************** Alignment Constraints ********************/

  function alignment(elements, definition, cid) {
    let nodes = elements;

    // Compute the alignment offset
    let offsets = {};
    nodes.forEach(function (node) {
      switch (definition.orientation) {
        case "top":
          offsets[node._id] = node.height / 2;
          break;
        case "bottom":
          offsets[node._id] = -node.height / 2;
          break;
        case "left":
          offsets[node._id] = node.width / 2;
          break;
        case "right":
          offsets[node._id] = -node.width / 2;
          break;
        default:
          offsets[node._id] = 0;
      }
    });

    // Generate the CoLa constraints
    let results = [];
    results = results.concat(
      CoLaAlignment(nodes, definition.axis, offsets, cid)
    );
    return results;
  }
  /********************** Order Constraints **********************/

  function generateOrderFunc(definition) {
    let order;
    if (definition.hasOwnProperty("order")) {
      if (definition.hasOwnProperty("reverse") && definition.reverse)
        definition.order.reverse();
      order = function (n1, n2) {
        return (
          definition.order.indexOf(n1[definition.by]) -
          definition.order.indexOf(n2[definition.by])
        );
      };
    } else if (definition.hasOwnProperty("reverse") && definition.reverse) {
      order = function (n1, n2) {
        return n1[definition.by] - n2[definition.by];
      };
    } else {
      order = function (n1, n2) {
        return n2[definition.by] - n1[definition.by];
      };
    }
    return order;
  }
  function orderElements(elements, definition, cid) {
    if (elements[0] instanceof Array) {
      return orderSets(elements, definition, cid);
    } else {
      return orderNodes(elements, definition, cid);
    }
  }
  function orderNodes(nodes, definition, cid) {
    // Sort the nodes into groups
    let order = generateOrderFunc(definition);
    nodes = nodes.sort(order);

    // Generate the CoLa constraints
    let results = [];
    let axis = definition.axis;
    let gap = definition.gap ? definition.gap : _gap;
    for (let i = 0; i < nodes.length - 1; i++) {
      let left = nodes[i + 1];
      let right = nodes[i];
      results.push(CoLaPosition(left, right, axis, cid, gap));
    }
    return results;
  }
  function orderSets(elements, definition, cid) {
    // Sort the elements into groups
    let order = generateOrderFunc(definition);
    elements = elements.sort(order);

    // Compute the band for the nodes
    let upperbound, offset, leftOffset, rightOffset, fixed;
    if (definition.band) {
      upperbound = elements.length;
      offset = definition.band;
      leftOffset = 0;
      rightOffset = 1;
      fixed = true;
    } else {
      upperbound = elements.length - 2;
      offset = _gap;
      leftOffset = -1;
      rightOffset = 0;
      fixed = true;
    }

    // Create a new node at the barrier of each band
    let barriers = [];
    let nodeSize = 1;
    let prev = 0;
    for (let i = 0; i <= upperbound; i++) {
      let node = {
        _cid: cid,
        _temp: true,
        fixed: fixed,
        width: nodeSize,
        height: nodeSize,
        padding: 0,
      };
      node.name = cid + "_boundary_" + i;

      let tempOffset = _graphNodes().filter(function (node) {
        return node._temp;
      }).length;

      let other = definition.axis == "x" ? "y" : "x";
      node.boundary = definition.axis;
      if (definition.band) {
        node[definition.axis] = i * offset;
      } else {
        let offsetTest =
          (Math.sqrt(elements[i + 1].length) + 2) * elements[i + 1][0].size +
          prev;
        node[definition.axis] = i * offset;
      }
      node[other] = tempOffset * nodeSize * 10;

      barriers.push(node);
      _graphNodes(_graphNodes().concat([node]));
    }
    // Compute the constraints to order the nodes
    let results = [];
    elements.forEach(function (set, index) {
      let left = barriers[index + leftOffset];
      let right = barriers[index + rightOffset];
      let gap = definition.gap ? definition.gap : _gap;

      // Flatten the sets to get to the base nodes.
      let nodes = [].concat(...set);
      nodes.forEach(function (node) {
        if (definition.hasOwnProperty("band") || index != 0) {
          results.push(CoLaPosition(left, node, definition.axis, cid, gap));
        }
        if (definition.hasOwnProperty("band") || index != elements.length - 1) {
          results.push(CoLaPosition(node, right, definition.axis, cid, gap));
        }
      });
    });

    return results;
  }
  /********************* Position Constraints ********************/

  function position(elements, definition, cid) {
    let nodes;
    if (elements[0] instanceof Array) {
      nodes = [].concat(...elements);
    } else {
      nodes = elements;
    }

    // Get the guide the elements are positioned relative to.
    let guide = _graphNodes().filter(function (node) {
      return node.name === definition.of && node._guide;
    })[0];

    // Create the position constraints relative to the temp node
    let results = [];
    let gap = definition.gap || _gap;
    for (let i = 0; i < nodes.length; i++) {
      switch (definition.position) {
        case "left":
          results.push(CoLaPosition(nodes[i], guide, "x", cid, gap));
          break;
        case "right":
          results.push(CoLaPosition(guide, nodes[i], "x", cid, gap));
          break;
        case "above":
          results.push(CoLaPosition(nodes[i], guide, "y", cid, gap));
          break;
        case "below":
          results.push(CoLaPosition(guide, nodes[i], "y", cid, gap));
          break;
        default:
          console.error("Unknown position: '" + definition.position + "'");
      }
    }
    return results;
  }
  /********************** Circle Constraints *********************/

  function circle(elements, definition, cid) {
    let nodes = elements;

    // Constants for computing edge length
    let gap = definition.gap || _gap;
    let angle = 360 / nodes.length;
    let edge = Math.sqrt(
      2 * gap ** 2 - 2 * gap ** 2 * Math.cos((angle / 180) * Math.PI)
    );

    // Label links that have at least one node in the circle layout
    _graphLinks().forEach(function (link) {
      let source = _graphNodes()[link.source];
      let target = _graphNodes()[link.target];
      if (nodes.indexOf(source) != -1 || nodes.indexOf(target) != -1) {
        link.circle = true;
      }
    });

    // Create links for every node in the circle
    let links = [];
    for (let i = 0; i < nodes.length; i++) {
      let index = i == 0 ? nodes.length - 1 : i - 1;
      let node = _graphNodes().indexOf(nodes[index]);
      let next = _graphNodes().indexOf(nodes[i]);
      links.push({ source: node, target: next, length: edge, _temp: true });
    }
    // Create or extract the center point.
    let center;
    switch (definition.around) {
      case "center":
        center = { name: cid + "_center", _temp: true, _cid: cid };
        _graphNodes(_graphNodes().concat([center]));
        break;
      default:
        console.error(
          "Missing or unknown center point for the circle constraint."
        );
    }

    // Create a new link from the center to all nodes in the circle
    nodes.forEach(function (node) {
      links.push({
        source: center._id,
        target: node._id,
        length: gap,
        _temp: true,
      });
    });
    _graphLinks(_graphLinks().concat(links));
  }
  /*********************** Hull Constraints **********************/

  function hull(elements, definition, cid) {
    let nodes = elements;

    let ids = nodes.map(function (node) {
      return node._id;
    });
    let group = { leaves: ids, _cid: cid };
    if (definition.style) group.style = definition.style;
    _groups(_groups().concat([group]));
  }
  /********************* Cluster Constraints *********************/

  function cluster(elements, definition, cid) {
    let nodes = elements;

    nodes.forEach(function (node, index) {
      for (let i = index + 1; i < nodes.length; i++) {
        _graphLinks(
          _graphLinks().concat([
            {
              source: node._id,
              target: nodes[i]._id,
              length: 1,
              _temp: true,
              _cid: cid,
            },
          ])
        );
      }
    });
  }
  /********************* Padding Constraints *********************/

  function padding(elements, definition, cid) {
    let nodes = elements;

    nodes.forEach(function (node) {
      node.pad = definition.amount;
      node.cid = definition.cid;
      node.spacing = true;
    });
  }
  /****************** Generate CoLa Constraints ******************/

  function CoLaAlignment(nodes, axis, offsets, cid) {
    let constraint = {
      type: "alignment",
      axis: axis == "x" ? "y" : "x",
      offsets: [],
      _type: cid,
    };
    nodes.forEach(function (node) {
      constraint.offsets.push({ node: node._id, offset: offsets[node._id] });
    });
    return constraint;
  }
  function CoLaPosition(left, right, axis, cid, gap) {
    let constraint = {
      axis: axis,
      left: left._id,
      right: right._id,
      gap: gap,
      _type: cid,
    };
    return constraint;
  }

  let _nodes, _links, _sets$1, _gap$1, _guides, _groups$1, _constraintDefs;
  let INDEX;

  function constraints(constraints) {
    if (constraints === undefined) {
      return _constraintDefs;
    } else {
      _constraintDefs = constraints;
      return this;
    }
  }
  function gap(gap) {
    if (gap === undefined) {
      return _gap$1;
    } else {
      _gap$1 = gap;
      return this;
    }
  }
  function groups(groups) {
    if (groups === undefined) {
      return _groups$1;
    } else {
      _groups$1 = groups;
      return this;
    }
  }
  function guides(guides) {
    if (guides === undefined) {
      return _guides;
    } else {
      _guides = guides;
      _nodes = _nodes.filter(function (node) {
        return !node._guide;
      }); // Remove previous guides.
      guides.map(generateGuides);
      return this;
    }
  }
  function links(links) {
    if (links === undefined) {
      return _links;
    } else {
      _links = links;
      _links.map(setLinkID);
      return this;
    }
  }
  function nodes(nodes) {
    if (nodes === undefined) {
      return _nodes;
    } else {
      _nodes = nodes;
      _nodes.map(setID);
      return this;
    }
  }
  function sets() {
    return _sets$1;
  }
  function layout() {
    INDEX = -1;

    if (!_nodes) console.error("No graph nodes defined.");
    if (!_links) links([]);
    if (!_groups$1) groups([]);
    if (!_guides) guides([]);
    if (!_constraintDefs) constraints([]);
    if (!_gap$1) gap(20);

    // Remove previously added internal properties.
    _nodes = _nodes.filter(function (node) {
      return !node._cid;
    });
    _links = _links.filter(function (link) {
      return !link._cid;
    });
    _groups$1 = _groups$1.filter(function (group) {
      return !group._cid;
    });

    // Compute additional graph properties as needed
    computeBuiltInProperties(_constraintDefs);

    // Generate the SetCoLa sets
    _sets$1 = {};
    for (let i = 0; i < _constraintDefs.length; i++) {
      let result = generateSets(_constraintDefs[i]);
      _sets$1[result.name] = result.sets;
    }

    // Generate the WebCoLa constraints
    // _constraintDefs.forEach(() => {});
    let webcolaConstraints = [].concat(
      ..._constraintDefs.map(generateConstraints)
    );

    // Produce the output spec
    return {
      nodes: nodes(),
      links: links(),
      groups: groups(),
      guides: guides(),
      constraints: webcolaConstraints,
      constraintDefs: constraints(),
    };
  }
  function generateGuides(guide) {
    let node = {
      _guide: true,
      _temp: true,
      fixed: true,
      width: 1,
      height: 1,
      padding: 0,
      x: Math.random() * 100,
      y: Math.random() * 100,
      boundary: "",
    };

    // Save the position information from the guide.
    let complete = false;
    if (guide.hasOwnProperty("x")) {
      node.x = guide.x;
      node.boundary += "x";
      complete = true;
    }
    if (guide.hasOwnProperty("y")) {
      node.y = guide.y;
      node.boundary += "y";
      complete = true;
    }
    if (!complete) {
      console.error("Guide must have an x and/or y position: ", guide);
    }

    // Save the name from the guide.
    if (guide.hasOwnProperty("name")) {
      let found = _nodes.filter(function (node) {
        return node.name === guide.name;
      });
      if (found.length > 0) {
        console.error(
          "A node with the name '" + guide.name + "' already exists."
        );
      } else {
        node.name = guide.name;
      }
    } else {
      console.error("Guide must have a name: ", guide);
    }

    // Save the guide and get it's index.
    _nodes.push(node);
    node._id = _nodes.indexOf(node);
    return node;
  }
  function generateSets(constraintDef) {
    let source = _nodes.filter(function (node) {
      return !node._temp;
    });
    if (constraintDef.from && typeof constraintDef.from === "string") {
      source = _sets$1[constraintDef.from];
    } else if (constraintDef.from) {
      source = computeSets(_nodes, constraintDef.from, _sets$1);
    }
    if (!constraintDef.name) constraintDef.name = "_set" + ++INDEX;
    return {
      name: constraintDef.name,
      sets: computeSets(source, constraintDef.sets, _sets$1),
    };
  }
  function generateConstraints(constraintDef) {
    let results = [];
    (constraintDef.forEach || []).forEach(function (constraint) {
      (_sets$1[constraintDef.name] || []).forEach(function (elements) {
        results = results.concat(
          computeConstraints(
            elements,
            constraint,
            constraintDef.name,
            _gap$1,
            nodes,
            links,
            groups
          )
        );
      });
    });
    return results;
  }
  /**********************************************************************/
  /************************** Graph Properties **************************/
  /**********************************************************************/

  function computeBuiltInProperties(constraints) {
    _nodes.forEach(setID);
    _links.forEach(setLinkID);

    // Compute numeric properties for the nodes
    let hasProperty = function (c, p) {
      return JSON.stringify(c).indexOf(p) != -1;
    };
    if (hasProperty(constraints, "depth")) {
      calculateDepths();
      _nodes.forEach(function (node) {
        delete node.visited;
      });
    }
    if (hasProperty(constraints, "degree")) calculateDegree();

    // Add accessors to get properties returning graph nodes/edges
    _nodes.forEach(function (node) {
      node.getSources = function () {
        return getSources(this);
      };
      node.getTargets = function () {
        return getTargets(this);
      };
      node.getNeighbors = function () {
        return getNeighbors(this);
      };
      node.getIncoming = function () {
        return getIncoming(this);
      };
      node.getOutgoing = function () {
        return getOutgoing(this);
      };
      node.getEdges = function () {
        return getEdges(this);
      };
      node.getFirstChild = function () {
        return getFirstChild(this);
      };
    });
  }
  function setID(node) {
    node._id = node._id || _nodes.indexOf(node);
  }
  function setLinkID(link) {
    link._linkid = link._linkid || _links.indexOf(link);
  }
  function graphSources() {
    return _nodes.filter(function (node) {
      if (node.hasOwnProperty("_isSource")) return node._isSource;
      let incoming = getIncoming(node).filter(function (n) {
        return n.source !== n.target;
      });
      return incoming.length === 0;
    });
  }
  function calculateDepths() {
    let roots = graphSources();
    if (roots.length === 0 && _nodes.length !== 0) {
      console.error(
        "No roots exist, so cannot compute node depth. Please assign a '_isSource' property to the root and try again."
      );
    }
    _nodes.forEach(getDepth);
  }
  function calculateDegree() {
    _nodes.forEach(function (node) {
      node.degree = node.degree || getDegree(node);
    });
  }
  // The list of nodes that have edges for which the input is the target
  // (e.g., the node's parents).
  function getSources(node) {
    let incoming = getIncoming(node);
    let sources = incoming.map(function (link) {
      return typeof link.source === "object"
        ? link.source
        : _nodes[link.source];
    });
    return sources;
  }
  // The list of nodes that have edges for which the input is the source
  // (e.g., the node's children).
  function getTargets(node) {
    let outgoing = getOutgoing(node);
    let targets = outgoing.map(function (link) {
      return typeof link.target == "object" ? link.target : _nodes[link.target];
    });
    return targets;
  }
  // The list of nodes that have edges connected to the input (e.g., the
  // node's neighbors).
  function getNeighbors(node) {
    let sources = node.sources || getSources(node);
    let targets = node.targets || getTargets(node);
    return sources.concat(targets);
  }
  // The list of edges that have the input as the target (e.g., edges
  // connecting the node to its parents).
  function getIncoming(node) {
    let index = node._id;
    let incoming = _links.filter(function (link) {
      let source =
        typeof link.source === "object" ? link.source._id : link.source;
      let target =
        typeof link.target === "object" ? link.target._id : link.target;
      return target == index && source !== index;
    });
    return incoming;
  }
  // The list of edges that have the input as the source (e.g., edges
  // connecting the node to its children).
  function getOutgoing(node) {
    let index = node._id;
    let outgoing = _links.filter(function (link) {
      let source =
        typeof link.source === "object" ? link.source._id : link.source;
      let target =
        typeof link.target === "object" ? link.target._id : link.target;
      return source == index && target !== index;
    });
    return outgoing;
  }
  // The list of edges that contain the input (e.g., edges connecting the
  // node to its neighbors).
  function getEdges(node) {
    let incoming = node.incoming || getIncoming(node);
    let outgoing = node.outgoing || getOutgoing(node);
    return incoming.concat(outgoing);
  }
  // The number of neighbors for the current node.
  function getDegree(node) {
    let incoming = node.incoming || getIncoming(node);
    let outgoing = node.outgoing || getOutgoing(node);
    return incoming.length + outgoing.length;
  }
  function getDepth(node) {
    if (node.hasOwnProperty("depth")) return node.depth;
    if (node.visited)
      console.error("Cannot compute the depth for a graph with cycles.");
    node.visited = true;
    node.depth = Math.max(0, Math.max(...getSources(node).map(getDepth)) + 1);
    return node.depth;
  }
  function getFirstChild(node) {
    let outgoing = node.outgoing || getOutgoing(node);
    outgoing = outgoing.sort(function (a, b) {
      return a._id - b._id;
    });
    outgoing = outgoing.filter(function (n) {
      return n.target !== n.source;
    });
    if (outgoing.length == 0) return null;
    return _nodes[outgoing[0].target];
  }

  exports.constraints = constraints;
  exports.gap = gap;
  exports.groups = groups;
  exports.guides = guides;
  exports.links = links;
  exports.nodes = nodes;
  exports.sets = sets;
  exports.layout = layout;

  Object.defineProperty(exports, "__esModule", { value: true });
});
