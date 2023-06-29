class CytoscapeDisplay {
  constructor(
    container,
    cytoscapeSettings = {},
    nodes = [],
    edges = [],
    directed = false
  ) {
    cytoscapeSettings["container"] = container;
    this.cy = cytoscape(cytoscapeSettings);
    console.log(this.cy);
    this.cy.add(nodes);
    this.cy.add(edges);
    this.cy.layout(cytoscapeSettings["layout"]).run();
    this.rerunLayout();
    this.refit();
    this.directed = directed;
  }

  addNode(nodeId, label, x = null, y = null) {
    this.cy.add({
      group: "nodes",
      data: { id: nodeId, label: label },
      position: { x: x, y: y },
    });
  }

  refit() {
    this.cy.fit();
  }

  rerunLayout() {
    // return;
    // if there is a layout, run it
    // if (this.cy.layout()) {
    //   this.cy.layout().run();
    // }
  }

  addEdge(sourceId, targetId) {
    this.cy.add({
      group: "edges",
      data: {
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
      },
    });
  }

  removeNode(nodeId) {
    this.cy.remove(`node[id = "${nodeId}"]`);
  }

  removeEdge(sourceId, targetId) {
    this.cy.remove(`edge[id = "edge-${sourceId}-${targetId}"]`);
  }

  setNodeLabel(nodeId, label) {
    this.cy.$id(nodeId).data("label", label);
  }

  setEdgeLabel(sourceId, targetId, label) {
    this.cy.$id(`edge-${sourceId}-${targetId}`).data("label", label);
  }

  highlightNode(nodeId, color) {
    this.cy.$id(nodeId).style("background-color", color);
  }

  highlightNodeReturnUndoFunction(nodeId, color) {
    console.log(`highlightNodeReturnUndoFunction ${nodeId} ${color}`);
    const oldColor = this.cy.$id(nodeId).style("background-color");
    this.cy.$id(nodeId).style("background-color", color);
    return () => {
      this.cy.$id(nodeId).style("background-color", oldColor);
    };
  }

  highlightEdge(sourceId, targetId, color) {
    this.cy.$id(`edge-${sourceId}-${targetId}`).style("line-color", color);
  }

  highlightEdgeReturnUndoFunction(sourceId, targetId, color) {
    const oldColor = this.cy
      .$id(`edge-${sourceId}-${targetId}`)
      .style("line-color");
    this.cy.$id(`edge-${sourceId}-${targetId}`).style("line-color", color);
    return () => {
      this.cy.$id(`edge-${sourceId}-${targetId}`).style("line-color", oldColor);
    };
  }

  asAdjacencyList() {
    const adjacencyList = {};
    this.cy.nodes().forEach((node) => {
      adjacencyList[node.id()] = [];
    });
    this.cy.edges().forEach((edge) => {
      adjacencyList[edge.source().id()].push(edge.target().id());
      if (!this.directed) {
        adjacencyList[edge.target().id()].push(edge.source().id());
      }
    });
    return adjacencyList;
  }
}

GRAPH_SETTINGS = {
  style: [
    {
      selector: "node",
      style: {
        "background-color": "#666",
        label: "data(id)",
        "text-valign": "center", // Vertical alignment in the node's center
        "text-halign": "center", // Horizontal alignment in the node's center
      },
    },
    {
      selector: "edge",
      style: {
        width: 3,
        "line-color": "#000",
        "target-arrow-shape": this.graph.isDirected ? "triangle" : "none",
        "target-arrow-color": "#000",
        "curve-style": "bezier",
      },
    },
  ],
  layout: {
    name: "fcose",
    fit: true, // Whether to fit the viewport to the graph
    padding: 30, // Padding on fit
    avoidOverlap: true, // prevents node overlap
    avoidOverlapPadding: 10, // Extra spacing around nodes when avoidOverlap: true
  },
  minZoom: 0.3, // minimum zoom level
  maxZoom: 10, // maximum zoom level
};

GRID_SETTINGS = {
  style: [
    {
      selector: "node",
      style: {
        "background-color": "white",
        "border-color": "black",
        "border-width": "2px",
        "border-style": "solid",
        width: this.cellWidth,
        height: this.cellHeight,
        shape: "rectangle",
        label: "data(label)",
        "text-valign": "center", // Vertical alignment in the node's center
        "text-halign": "center", // Horizontal alignment in the node's center
      },
    },
  ],
  layout: {
    name: "preset",
    positions: (node) => {
      const [row, col] = node.id().slice(4).split("-").map(Number);
      return { x: col * this.cellWidth, y: row * this.cellHeight };
    },
  },
  minZoom: 0.3, // minimum zoom level
  maxZoom: 10, // maximum zoom level
  autoungrabify: true, // prevent nodes from being moved
};

function createRandomGraph(numNodes, numEdges) {
  const nodes = [];
  const edges = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({ data: { id: i, label: i } });
  }
  for (let i = 0; i < numEdges; i++) {
    const source = Math.floor(Math.random() * numNodes);
    const target = Math.floor(Math.random() * numNodes);
    edges.push({
      data: {
        id: `edge-${source}-${target}`,
        source: source,
        target: target,
      },
    });
  }
  return { nodes: nodes, edges: edges };
}
