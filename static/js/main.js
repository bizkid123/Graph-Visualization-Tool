const socket = io.connect("http://" + document.domain + ":" + location.port);

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
    this.isFinished = false;
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
        await new Promise((resolve) => (this.resolveFunc = resolve));
      }

      const step = this.steps[this.currentStepIndex];
      const undoStep = await step.action();
      this.undoSteps[this.currentStepIndex] = undoStep;
      this.currentStepIndex++;
      document.getElementById("slider").value = this.currentStepIndex;
      await this.sleep(step.delay);
    }
    this.isFinished = true;
  }

  pauseAnimation() {
    this.isPaused = true;
  }

  resumeAnimation() {
    if (this.isFinished) {
      this.playAnimation();
    } else if (this.isPaused && this.resolveFunc) {
      console.log("resuming");
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
      if (this.currentStepIndex !== 0) {
        this.steps[this.currentStepIndex - 1].action();
      }
      document.getElementById("slider").value = this.currentStepIndex;
    }
  }

  stepForward() {
    if (this.currentStepIndex < this.steps.length) {
      const step = this.steps[this.currentStepIndex];
      const undoStep = step.action();
      this.undoSteps[this.currentStepIndex] = undoStep;
      this.currentStepIndex++;
      document.getElementById("slider").value = this.currentStepIndex;
    }
  }

  moveTo(stepIndex) {
    if (stepIndex < this.currentStepIndex) {
      while (this.currentStepIndex > stepIndex) {
        this.stepBack();
      }
    } else if (stepIndex > this.currentStepIndex) {
      while (this.currentStepIndex < stepIndex) {
        this.stepForward();
      }
      this.stepForward();
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
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    n.removeClass("selected");
  });
}

// Event listener for the Add Edge button
document.getElementById("addEdge").addEventListener("click", function () {
  reset();
  console.log("add edge");
  addEdgeMode = true;
  addNodeMode = false;
  deleteNodeMode = false;
  deleteEdgeMode = false;
});

document.getElementById("addNode").addEventListener("click", function () {
  reset();
  console.log("add node");
  addNodeMode = true;
  addEdgeMode = false;
  deleteNodeMode = false;
  deleteEdgeMode = false;
});

document.getElementById("deleteNode").addEventListener("click", function () {
  reset();
  deleteNodeMode = true;
  addNodeMode = false;
  addEdgeMode = false;
  deleteEdgeMode = false;
});

document.getElementById("deleteEdge").addEventListener("click", function () {
  reset();
  deleteEdgeMode = true;
  addNodeMode = false;
  addEdgeMode = false;
  deleteNodeMode = false;
});

let graph = new CytoscapeGraph(
  document.getElementById("cy"),
  createEmptyGraph()
);

function pauseAnimation() {
  animationController.pauseAnimation();
}

function resumeAnimation() {
  animationController.resumeAnimation();
}

function resetAnimation() {
  animationController.resetAnimation();
}

function highlightNode(graph, nodeId, color) {
  const step = new Step(highlightNodeFunc(graph, nodeId, color), 20);
  animationController.addStep(step);
}

function highlightNodeFunc(graph, nodeId, color) {
  return () => {
    let currentColor = graph.cy
      .getElementById(`${nodeId}`)
      .style("background-color");
    graph.cy.getElementById(`${nodeId}`).style("background-color", color);
    return () => {
      graph.cy
        .getElementById(`${nodeId}`)
        .style("background-color", currentColor);
    };
  };
}

document
  .getElementById("graph-creation-method")
  .addEventListener("change", function () {
    var method = this.value;
    var numEdgesInput = document.getElementById("num-edges");
    var numNodesInput = document.getElementById("num-nodes");
    var numEdgesInputLabel = document.getElementById("num-edges-label");
    var numNodesInputLabel = document.getElementById("num-nodes-label");

    if (method === "random") {
      numEdgesInput.style.display = "block";
      numNodesInput.style.display = "block";
      numNodesInput.value = 10;
      numEdgesInput.value = 15;
      numEdgesInputLabel.style.display = "block";
      numNodesInputLabel.style.display = "block";
      // Set text to default values
      numNodesInputLabel.innerHTML = "Number of Edges:";
      numEdgesInputLabel.innerHTML = "Number of Nodes:";
    } else if (method === "grid") {
      numEdgesInput.style.display = "none";
      numEdgesInputLabel.style.display = "none";

      numNodesInput.style.display = "block";
      numNodesInputLabel.style.display = "block";

      numNodesInput.value = 5;
      numEdgesInput.value = 5;

      numNodesInputLabel.innerHTML = "Number of rows:";
      numEdgesInputLabel.innerHTML = "Number of columns:";
    } else if (method === "empty") {
      numEdgesInput.style.display = "none";
      numNodesInput.style.display = "none";
      numEdgesInputLabel.style.display = "none";
      numNodesInputLabel.style.display = "none";
    }
  });

document.getElementById("createGraph").addEventListener("click", () => {
  clearHighlight();

  addEdgeMode = false;
  addNodeMode = false;
  deleteNodeMode = false;
  deleteEdgeMode = false;

  document.getElementById("play-pause").disabled = true;
  document.getElementById("step-back").disabled = true;
  document.getElementById("slider").disabled = true;
  document.getElementById("step-forward").disabled = true;

  graph = new CytoscapeGraph(document.getElementById("cy"), createEmptyGraph());
  const method = document.getElementById("graph-creation-method").value;

  const directed = document.getElementById("directed").checked;

  if (method === "random") {
    const n = parseInt(document.getElementById("num-nodes").value);
    const m = parseInt(document.getElementById("num-edges").value);
    graph.reset(createRandomGraph(n, m, directed));
  } else if (method === "grid") {
    const n = parseInt(document.getElementById("num-nodes").value);
    const m = parseInt(document.getElementById("num-edges").value);
    graph.reset(createGridGraph(n, m, directed));
  } else if (method === "empty") {
    graph.reset(createEmptyGraph(directed));
  }
  resetAnimation();
});

document.getElementById("createArray").addEventListener("click", () => {
  const n = parseInt(document.getElementById("num-rows").value);
  const m = parseInt(document.getElementById("num-columns").value);
  graph = new CytoscapeGrid(
    document.getElementById("cy"),
    createGrid(n, m, null)
  );
  resetAnimation();
});

document.getElementById("run-algorithm").addEventListener("click", () => {
  addEdgeMode = false;
  addNodeMode = false;
  deleteNodeMode = false;
  deleteEdgeMode = false;
  resetAnimation();
  const algorithm = document.getElementById("algorithm").value;
  const startNode = 0;
  socket.emit("run_algorithm", algorithm, [
    graph.graph.getAdjacencyList(),
    startNode,
  ]);
});

var highlightedLineNumber = null;

function highlightLine(lineNumber) {
  var codeElement = document.getElementById("code");
  var lines = codeElement.innerHTML.split("\n");

  if (lineNumber < 1 || lineNumber > lines.length) {
    return;
  }

  // Unhighlight the previously highlighted line
  if (highlightedLineNumber !== null) {
    lines[highlightedLineNumber - 1] = lines[highlightedLineNumber - 1]
      .replace("<mark>", "")
      .replace("</mark>", "");
  }

  // Highlight the new line
  lines[lineNumber - 1] = "<mark>" + lines[lineNumber - 1] + "</mark>";
  codeElement.innerHTML = lines.join("\n");

  // Update the highlighted line number
  highlightedLineNumber = lineNumber;
}

function clearHighlight() {
  var codeElement = document.getElementById("code");
  var lines = codeElement.innerHTML.split("\n");

  highlightedLineNumber = null;

  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replace("<mark>", "").replace("</mark>", "");
  }

  codeElement.innerHTML = lines.join("\n");
}

function updateVariableExplorer(variables) {
  var table = document.getElementById("variables");
  table.innerHTML = ""; // clear the table

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

function displayCode(code) {
  console.log("displaying code");
  var formatted_code = Prism.highlight(code, Prism.languages.python, "python");
  document.getElementById("code").innerHTML = formatted_code;
}

socket.on("display_code", function (msg) {
  displayCode(msg.code);
});

socket.on("highlight_node", function (msg) {
  highlightNode(graph, msg.node, msg.color);
});

function progressLine(lineNumber, variables) {
  return () => {
    highlightLine(lineNumber);
    updateVariableExplorer(variables);
    return () => {};
  };
}

socket.on("new_line", function (msg) {
  const step = new Step(progressLine(msg.lineNumber, msg.variables), 20);
  animationController.addStep(step);
});

socket.on("algorithm_finished", function (msg) {
  // Enable the run algorithm button
  document.getElementById("play-pause").disabled = false;
  document.getElementById("step-back").disabled = false;
  document.getElementById("slider").disabled = false;
  document.getElementById("step-forward").disabled = false;

  // Set slider range
  document.getElementById("slider").max = animationController.steps.length - 1;

  // Set the current step to the first step
  animationController.currentStep = 0;
});

document.getElementById("play-pause").addEventListener("click", () => {
  if (animationController.isPaused) {
    console.log("play");
    resumeAnimation();
  } else {
    console.log("pause");
    pauseAnimation();
  }
});

document.getElementById("step-back").addEventListener("click", () => {
  pauseAnimation();
  animationController.stepBack();
});

document.getElementById("step-forward").addEventListener("click", () => {
  pauseAnimation();
  animationController.stepForward();
});

document.getElementById("slider").addEventListener("input", () => {
  pauseAnimation();
  animationController.moveTo(document.getElementById("slider").value);
});
