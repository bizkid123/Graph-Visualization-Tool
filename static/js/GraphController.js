class GraphController {
  constructor() {
    this.graph = null;
    this.mode = "ADD_NODE";
  }

  setMode(mode) {
    this.mode = mode;
  }

  createGraph() {
    console.log("Creating Graph");
    const numNodes = parseInt(document.getElementById("num-nodes").value);
    const numEdges = parseInt(document.getElementById("num-edges").value);
    const randomGraph = createRandomGraph(numNodes, numEdges);
    const nodes = randomGraph.nodes;
    const edges = randomGraph.edges;
    console.log(nodes);
    console.log(edges);
    console.log(this);
    this.graph = new CytoscapeDisplay(
      document.getElementById("cy"),
      GRAPH_SETTINGS,
      nodes,
      edges
    );
  }

  getGraph() {
    return this.graph.asAdjacencyList();
  }

  highlightNodeReturnUndoFunction(nodeId, color) {
    return () => {
      return this.graph.highlightNodeReturnUndoFunction(nodeId, color);
    };
  }

  highlightEdgeReturnUndoFunction(sourceId, targetId, color) {
    return () => {
      return this.graph.highlightEdgeReturnUndoFunction(sourceId, targetId);
    };
  }
}
