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