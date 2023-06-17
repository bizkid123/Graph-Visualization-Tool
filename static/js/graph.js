class Graph {
  constructor(isDirected = false, isWeighted = false) {
    this.adjacencyList = {};
    this.edgeWeights = {};
    this.isDirected = isDirected;
    this.isWeighted = isWeighted;
  }

  addNode(id = null) {
    if (id === null) {
      id = Object.keys(this.adjacencyList).length;
    }
    if (!this.adjacencyList[id]) {
      this.adjacencyList[id] = [];
    }
  }

  nextNodeId() {
    return Object.keys(this.adjacencyList).length;
  }

  addEdge(node1, node2, weight = 1) {
    const edgeId = `${node1}-${node2}`;
    const reverseEdgeId = `${node2}-${node1}`;
    console.log(`Node 1: ${node1}, Node 2: ${node2}, Weight: ${weight}, Edge ID: ${edgeId}, Reverse Edge ID: ${reverseEdgeId}`)
    if (!this.adjacencyList[node1].includes(node2)) {
      this.adjacencyList[node1].push(node2);
      if (!this.isDirected) {
        this.adjacencyList[node2].push(node1);
      }
    }

    if (this.isWeighted) {
      this.edgeWeights[edgeId] = weight;
      if (!this.isDirected) {
        this.edgeWeights[reverseEdgeId] = weight;
      }
    }
  }

    removeNode(nodeId) {
    if (this.isDirected) {
        for (let otherNode in this.adjacencyList) {
        this.adjacencyList[otherNode] = this.adjacencyList[otherNode].filter(node => node !== nodeId);
        }
    }
    while (this.adjacencyList[nodeId].length > 0) {
        this.removeEdge(nodeId, this.adjacencyList[nodeId][0]);
    }
    delete this.adjacencyList[nodeId];
    }

  removeEdge(node1, node2) {
    const edgeId = `${node1}-${node2}`;
    const reverseEdgeId = `${node2}-${node1}`;

    this.adjacencyList[node1] = this.adjacencyList[node1].filter(node => node !== node2);
    if (!this.isDirected) {
      this.adjacencyList[node2] = this.adjacencyList[node2].filter(node => node !== node1);
    }

    if (this.isWeighted) {
      delete this.edgeWeights[edgeId];
      if (!this.isDirected) {
        delete this.edgeWeights[reverseEdgeId];
      }
    }
  }

  getAdjacencyList() {
    return this.adjacencyList;
  }

  getEdgeWeights() {
    return this.edgeWeights;
  }
}

class CytoscapeGraph {
  constructor(container, graph) {
    this.graph = graph;

    // Initialize cytoscape with styling
    this.cy = cytoscape({
      container,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': this.graph.isDirected ? 'triangle' : 'none',
            'curve-style': 'bezier'
          }
        }
      ]
    });
    
    this.cy.on('tap', (event) => {
      if (addNodeMode) {
        const x = event.position.x;
        const y = event.position.y;
        const nodeId = this.graph.nextNodeId();
        this.addNode(nodeId, x, y);
        addNodeMode = false;
      }
    });

    // Event listener for node clicks
    this.cy.on('tap', 'node', (evt) => { // arrow function here
        if (addEdgeMode) {
            let node = evt.target;

            // Change the color of the selected node
            node.addClass('selected');

            selectedNodes.push(node);

            // Check if two nodes have been selected
            if (selectedNodes.length >= 2) {
                console.log('Adding edge between ' + selectedNodes[0].id() + ' and ' + selectedNodes[1].id());

                // Add an edge between the selected nodes
                let edgeId = 'edge' + selectedNodes[0].id() + 'to' + selectedNodes[1].id();
                console.log(this);
                console.log(this.graph);
                console.log(this.graph.getAdjacencyList());
                this.graph.addEdge(selectedNodes[0].id(), selectedNodes[1].id());
                this.update();
            }
        }
    });

  }

  update() {
    const adjacencyList = this.graph.getAdjacencyList();
    const edgeWeights = this.graph.getEdgeWeights();

    for (let nodeId in adjacencyList) {
      if (!this.cy.$id(nodeId).nonempty()) {
        this.cy.add({ data: { id: nodeId } });
      }
    }
    for (let nodeId in adjacencyList) {
      adjacencyList[nodeId].forEach(neighborId => {
          const edgeId = `${nodeId}-${neighborId}`;
          const reverseEdgeId = `${neighborId}-${nodeId}`;
          if (this.cy.$id(edgeId).nonempty()) {
            return;
          }
          if (this.graph.isDirected || !(this.cy.$id(reverseEdgeId).nonempty())) {
            console.log(`Adding edge ${edgeId}`);
            let edgeData = {
                id: edgeId,
                source: nodeId,
                target: neighborId,
                curveStyle: !this.cy.$id(reverseEdgeId).nonempty() ? 'bezier' : 'haystack'
            };

            this.cy.add({ data: edgeData });
          }
      });
    }
  }

  runLayout() {
    let layout = this.cy.layout({
      name: 'cose',
      fit: true, // Whether to fit the viewport to the graph
      padding: 30, // Padding on fit
      avoidOverlap: true, // prevents node overlap
      avoidOverlapPadding: 10, // Extra spacing around nodes when avoidOverlap: true
    });

    layout.run();
  }

  addNode(nodeId = null, x = null, y = null) {
    if (nodeId == null) {
      nodeId = this.graph.nextNodeId();
    }
    this.graph.addNode(nodeId);

    if (x == null || y == null) {
      this.cy.add({ data: { id: nodeId } });
    }
    else {
      console.log(`Adding node ${nodeId} at position (${x}, ${y})`);
      this.cy.add({ data: { id: nodeId }, position: { x: x, y: y } });
    }

    this.update();
  }

  removeNode(nodeId) {
    this.graph.removeNode(nodeId);
    this.cy.$id(nodeId).remove();
    this.update();
  }

  removeEdge(node1, node2) {
    const edgeId = `${node1}-${node2}`;
    this.graph.removeEdge(node1, node2);
    this.cy.$id(edgeId).remove();
    if (!this.graph.isDirected) {
        const reverseEdgeId = `${node2}-${node1}`;
        this.cy.$id(reverseEdgeId).remove();
    }
    this.update();
  }

  reset(newGraph) {
    this.cy.elements().remove();
    this.graph = newGraph;
    this.update();
    this.runLayout();
  }
}

function createEmptyGraph(isDirected = false) {
  return new Graph(isDirected);
}

function createGrid(n) {
    const graph = new Graph();
    for (let i = 0; i < n*n; i++) {
        graph.addNode(i);
    }
    for (let i = 0; i < n*n; i++) {
        console.log("i=" + i+ " n=" + n);
        if (i % n !== 0) {
            graph.addEdge(i, i-1);
        }
        // if (i % n !== n-1) {
        //     graph.addEdge(i, i+1);
        // }
        if (i >= n) {
            graph.addEdge(i, i-n);
        }
        // if (i < n*(n-1)) {
        //     graph.addEdge(i, i+n);
        // }
    }
    return graph;
}