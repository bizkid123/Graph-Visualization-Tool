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
