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


let graph = new CytoscapeGraph(document.getElementById('cy'), createGrid(5));





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


document.getElementById('run-algorithm').addEventListener('click', () => {
    const n = parseInt(document.getElementById('num-nodes').value);
    
    graph.reset(createGrid(n));
    resetHighlight();
    socket.emit("run_algorithm", graph.graph.getAdjacencyList());
});

socket.on('highlight_node', function(msg) {
    highlightNode(graph, msg.node, msg.color);
});