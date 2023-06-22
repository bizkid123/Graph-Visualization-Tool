


const socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('connect', function() {
    console.log('Connected to server');
});

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
// let graph = new CytoscapeGrid(document.getElementById('cy'), createGrid(5,5,0));

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
        console.log(`Highlighting node ${nodeId} with color ${color}`);
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
  var numEdgesInputLabel = document.getElementById('num-edges-label');
  var numNodesInputLabel = document.getElementById('num-nodes-label');

  if (method === 'random') {
    numEdgesInput.style.display = 'block';
    numNodesInput.style.display = 'block';
    numNodesInput.value = 15;
    numEdgesInput.value = 50;
    numEdgesInputLabel.style.display = 'block';
    numNodesInputLabel.style.display = 'block';
    // Set text to default values
    numNodesInputLabel.innerHTML = 'Number of Edges:';
    numEdgesInputLabel.innerHTML = 'Number of Nodes:';

  } else if (method === 'grid') {
    numEdgesInput.style.display = 'none';
    numEdgesInputLabel.style.display = 'none';
    
    numNodesInput.style.display = 'block';
    numNodesInputLabel.style.display = 'block';
    
    numNodesInput.value = 5;
    numEdgesInput.value = 5;

    numNodesInputLabel.innerHTML = 'Number of rows:';
    numEdgesInputLabel.innerHTML = 'Number of columns:';

  } else if (method === 'empty') {
    numEdgesInput.style.display = 'none';
    numNodesInput.style.display = 'none';
    numEdgesInputLabel.style.display = 'none';
    numNodesInputLabel.style.display = 'none';
  }
});

document.getElementById('createGraph').addEventListener('click', () => {
    addEdgeMode = false;
    addNodeMode = false;
    deleteNodeMode = false;
    deleteEdgeMode = false;

    graph = new CytoscapeGraph(document.getElementById('cy'), createEmptyGraph());
    console.log('Create Graph button clicked');
    const method = document.getElementById('graph-creation-method').value;

    
    const directed = document.getElementById('directed').checked;

    if (method === 'random') {
        const n = parseInt(document.getElementById('num-nodes').value);
        const m = parseInt(document.getElementById('num-edges').value);
        graph.reset(createRandomGraph(n, m, directed));
    }
    else if (method === 'grid') {
        const n = parseInt(document.getElementById('num-nodes').value);
        const m = parseInt(document.getElementById('num-edges').value);
        graph.reset(createGridGraph(n, m, directed));
    }
    else if (method === 'empty') {
        graph.reset(createEmptyGraph(directed));
    }
    resetHighlight();
});

document.getElementById('createArray').addEventListener('click', () => {
    const n = parseInt(document.getElementById('num-rows').value);
    const m = parseInt(document.getElementById('num-columns').value);
    graph = new CytoscapeGrid(document.getElementById('cy'), createGrid(n, m, null));
    resetHighlight();
});
    

document.getElementById('runAlgorithm').addEventListener('click', () => {
    addEdgeMode = false;
    addNodeMode = false;
    deleteNodeMode = false;
    deleteEdgeMode = false;
    socket.emit("run_algorithm", graph.graph.getAdjacencyList());
});


// Highlight nodes when requested
socket.on('highlight_node', function(msg) {
    console.log('HIGHLIGHT NODE');
    highlightNode(graph, msg.node, msg.color);
});


function displayCode(code) {
    document.getElementById('code').textContent = code;
}

function highlightLine(lineNumber) {
    var lines = document.getElementById('code').textContent.split('\n');
    lines[lineNumber - 1] = '<span class="highlight">' + lines[lineNumber - 1] + '</span>';
    document.getElementById('code').innerHTML = lines.join('\n');
}

document.addEventListener("DOMContentLoaded", function () {
    let yourPythonCode = "def dfs(graph, start, visited=None):\n    if visited is None:\n        visited = set()\n    visited.add(start)\n    for next in graph[start] - visited:\n        dfs(graph, next, visited)\n    return visited";
    var code = Prism.highlight(yourPythonCode, Prism.languages.python, 'python');
    document.getElementById('code').innerHTML = code;

var highlightedLineNumber = null;

function highlightLine(lineNumber) {
    var codeElement = document.getElementById('code');
    var lines = codeElement.innerHTML.split('\n');
    
    if (lineNumber < 1 || lineNumber > lines.length) {
        console.error('Invalid line number');
        return;
    }
    
    // Unhighlight the previously highlighted line
    if (highlightedLineNumber !== null) {
        lines[highlightedLineNumber - 1] = lines[highlightedLineNumber - 1].replace('<mark>', '').replace('</mark>', '');
    }
    
    // Highlight the new line
    lines[lineNumber - 1] = '<mark>' + lines[lineNumber - 1] + '</mark>';
    codeElement.innerHTML = lines.join('\n');
    
    // Update the highlighted line number
    highlightedLineNumber = lineNumber;
}
highlightLine(3);

function updateVariableExplorer(variables) {
    var table = document.getElementById('variables');
    table.innerHTML = ''; // clear the table

    // create table header
    var header = table.createTHead();
    var row = header.insertRow(0);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = "<b>Variable</b>";
    cell2.innerHTML = "<b>Value</b>";

    // add variables to table
    for (var key in variables) {
        var value = variables[key];
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = key;
        cell2.innerHTML = JSON.stringify(value);
    }
}

// updateVariableExplorer({x: 10, y: [1, 2, 3]});


});

