


const socket = io.connect('http://' + document.domain + ':' + location.port);

class Step {
    constructor(action, delay) {
        this.action = action;
        this.delay = delay;
    }
}

class AnimationController {
    constructor() {
        this.steps = [];
        this.undoSteps = [];
        this.currentStepIndex = 0;
        this.isPaused = false;
        this.resolveFunc = null;
    }

    addStep(step) {
        this.steps.push(step);
        this.undoSteps.push(null);
        if (this.steps.length === 1) {
            this.playAnimation();
        }
    }

    async playAnimation() {
        this.isPaused = false;
        while (this.currentStepIndex < this.steps.length) {
            if (this.isPaused) {
                await new Promise(resolve => this.resolveFunc = resolve);
            }
            
            const step = this.steps[this.currentStepIndex];
            const undoStep = await step.action();
            this.undoSteps[this.currentStepIndex] = undoStep;
            this.currentStepIndex++;
            await this.sleep(step.delay);
        }
    }

    pauseAnimation() {
        this.isPaused = true;
    }

    resumeAnimation() {
        if (this.isPaused && this.resolveFunc) {
            this.isPaused = false;
            this.resolveFunc();
            this.resolveFunc = null;
        }
    }

    stepBack() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.undoSteps[this.currentStepIndex]();
            if (this.currentStepIndex < 0) {
                this.currentStepIndex = 0;
            }
        }
    }

    stepForward() {
        if (this.currentStepIndex < this.steps.length) {
            const step = this.steps[this.currentStepIndex];
            const undoStep = step.action();
            this.undoSteps[this.currentStepIndex] = undoStep;
            this.currentStepIndex++;
        }
    }

    resetAnimation() {
        while (this.currentStepIndex > 0) {
            this.stepBack();
        }
        this.stepBack();

        this.currentStepIndex = 0;
        this.undoSteps = [];
        this.steps = [];
        this.isPaused = false;
        this.resolveFunc = null;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const animationController = new AnimationController();
let selectedNodes = [];
let addEdgeMode = false;
let addNodeMode = false;
let deleteNodeMode = false;
let deleteEdgeMode = false;

function reset() {
    selectedNodes = [];
    addEdgeMode = false;
    addNodeMode = false;
    graph.cy.nodes().forEach(function (n) {
        n.removeClass('selected');
    });
}

// Event listener for the Add Edge button
document.getElementById('addEdge').addEventListener('click', function () {
    reset();
    addEdgeMode = true;
    console.log('Add Edge button clicked');
});

document.getElementById('addNode').addEventListener('click', function () {
    reset();
    addNodeMode = true;
    console.log('Add Node button clicked');
});

document.getElementById('deleteNode').addEventListener('click', function () {
    reset();
    deleteNodeMode = true;
    console.log('Delete Node button clicked');
});

document.getElementById('deleteEdge').addEventListener('click', function () {
    reset();
    deleteEdgeMode = true;
    console.log('Delete Edge button clicked');
});


let graph = new CytoscapeGraph(document.getElementById('cy'), createEmptyGraph());





function highlightNode(graph, nodeId, color) {
    const step = new Step(highlightNodeFunc(graph, nodeId, color), 100);
    animationController.addStep(step);
}

function pauseHighlight() {
    animationController.pauseAnimation();
}

function resumeHighlight() {
    animationController.resumeAnimation();
}

function resetHighlight() {
    animationController.resetAnimation();
}

function highlightNodeFunc(graph, nodeId, color) {
    return () => {
        let currentColor = graph.cy.getElementById(`${nodeId}`).style('background-color');
        graph.cy.getElementById(`${nodeId}`).style('background-color', color);
        return () => {graph.cy.getElementById(`${nodeId}`).style('background-color', currentColor);}
    };
}


// Get the buttons
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const resetButton = document.getElementById('resetButton');

// Add event listeners
pauseButton.addEventListener('click', pauseHighlight);
resumeButton.addEventListener('click', resumeHighlight);
resetButton.addEventListener('click', resetHighlight);


document.getElementById('graph-creation-method').addEventListener('change', function() {
  var method = this.value;
  var numEdgesInput = document.getElementById('num-edges');
  var numNodesInput = document.getElementById('num-nodes');

  var nodeLabel = document.getElementById('node-label');
  var edgeLabel = document.getElementById('edge-label');

  if (method === 'random') {
    numEdgesInput.style.display = 'block';
    numNodesInput.style.display = 'block';
    nodeLabel.innerText = 'Number of nodes:';
    edgeLabel.innerText = 'Number of edges:';
    nodeLabel.style.display = 'block';
    edgeLabel.style.display = 'block';
  } else if (method === 'grid') {
    numEdgesInput.style.display = 'none';
    numNodesInput.style.display = 'block';
    nodeLabel.innerText = 'Grid Size (n x n):';
    edgeLabel.style.display = 'none';
    nodeLabel.style.display = 'block';
  } else if (method === 'empty') {
    numEdgesInput.style.display = 'none';
    numNodesInput.style.display = 'none';
    edgeLabel.style.display = 'none';
    nodeLabel.style.display = 'none';
  }
  
});

document.getElementById('createGraph').addEventListener('click', () => {
    const method = document.getElementById('graph-creation-method').value;
    const n = parseInt(document.getElementById('num-nodes').value);
    const m = parseInt(document.getElementById('num-edges').value);
    
    const directed = document.getElementById('directed').checked;

    if (method === 'random') {
        graph.reset(createRandomGraph(n, m, directed));
    }
    else if (method === 'grid') {
        graph.reset(createGrid(n, directed));
    }
    else if (method === 'empty') {
        graph.reset(createEmptyGraph(directed));
    }
    resetHighlight();
});


document.getElementById('runAlgorithm').addEventListener('click', () => {
    socket.emit("run_algorithm", graph.graph.getAdjacencyList());
});

socket.on('highlight_node', function(msg) {
    highlightNode(graph, msg.node, msg.color);
});