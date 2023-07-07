class UIController {
  constructor(graphController, animationController, serverEmitter) {
    this.graphController = graphController;
    this.animationController = animationController;
    this.serverEmitter = serverEmitter;
    this.setupEventListeners();
    this.highlightedLine = null;
  }

  setupEventListeners() {
    // this.setupModeButtons();
    this.setupGraphCreation();
    this.setupAlgorithmControl();
  }

  setupModeButtons() {
    document
      .getElementById("addEdge")
      .addEventListener("click", () =>
        this.graphController.setMode("ADD_EDGE")
      );
    document
      .getElementById("addNode")
      .addEventListener("click", () =>
        this.graphController.setMode("ADD_NODE")
      );
    document
      .getElementById("deleteNode")
      .addEventListener("click", () =>
        this.graphController.setMode("DELETE_NODE")
      );
    document
      .getElementById("deleteEdge")
      .addEventListener("click", () =>
        this.graphController.setMode("DELETE_EDGE")
      );
  }

  setupGraphCreation() {
    // Need to bind the graphController to the event listener
    document
      .getElementById("createGraph")
      .addEventListener(
        "click",
        this.graphController.createGraph.bind(this.graphController)
      );
    document
      .getElementById("createArray")
      .addEventListener(
        "click",
        this.graphController.createArray.bind(this.graphController)
      );
  }

  setupAlgorithmControl() {
    document
      .getElementById("run-algorithm")
      .addEventListener(
        "click",
        this.serverEmitter.emitRunAlgorithm.bind(this.serverEmitter)
      );
    document
      .getElementById("play-pause")
      .addEventListener(
        "click",
        this.animationController.playPauseAnimation.bind(
          this.animationController
        )
      );
    document
      .getElementById("step-forward")
      .addEventListener("click", function () {
        // Check if we're not exceeding the max value of the slider
        const slider = document.getElementById("slider");

        if (slider.value < slider.max) {
          slider.value = parseInt(slider.value) + 1;
          slider.dispatchEvent(new Event("input"));
        }
      });

    // Fetch the step-backward button
    document
      .getElementById("step-backward")
      .addEventListener("click", function () {
        // Check if we're not going below the min value of the slider
        const slider = document.getElementById("slider");
        if (slider.value > slider.min) {
          slider.value = parseInt(slider.value) - 1;
          slider.dispatchEvent(new Event("input"));
        }
      });
    document.getElementById("slider").addEventListener("input", (e) => {
      this.animationController.moveAnimationToStep(e.target.value);
    });
  }

  disableAnimationControls() {
    document.getElementById("play-pause").disabled = true;
    document.getElementById("step-back").disabled = true;
    document.getElementById("step-forward").disabled = true;
    document.getElementById("slider").disabled = true;
  }

  enableAnimationControls() {
    document.getElementById("play-pause").disabled = false;
    document.getElementById("step-back").disabled = false;
    document.getElementById("step-forward").disabled = false;
    document.getElementById("slider").disabled = false;
  }

  updateSlider(value, max) {
    const slider = document.getElementById("slider");
    slider.value = value;
    slider.max = max;
  }

  progressLine(lineNumber, variables) {
    this.markLine(lineNumber);
    this.updateVariableExplorer(variables);
  }

  progressLineReturnUndoFunction(lineNumber, variables) {
    return () => {
      const undoUpdateVariableExplorer =
        this.updateVariableExplorerReturnUndoFunction(variables)();
      const undoMarkLine = this.markLineReturnUndoFunction(lineNumber)();

      return () => {
        undoMarkLine();
        undoUpdateVariableExplorer();
      };
    };
  }

  markLine(lineNumber) {
    var codeElement = document.getElementById("code");
    var lines = codeElement.innerHTML.split("\n");

    if (lineNumber < 0 || lineNumber > lines.length) {
      return;
    }

    // Remove the highlight from the previous line
    if (this.highlightedLine !== null) {
      lines[this.highlightedLine] = lines[this.highlightedLine].replace(
        /^<mark>(.*)<\/mark>$/,
        "$1"
      );
    }

    // Highlight the new line
    lines[lineNumber] = "<mark>" + lines[lineNumber] + "</mark>";
    codeElement.innerHTML = lines.join("\n");

    // Update the highlighted line
    this.highlightedLine = lineNumber;
  }

  removeLineMarker(lineNumber) {
    var codeElement = document.getElementById("code");
    var lines = codeElement.innerHTML.split("\n");

    if (lineNumber < 0 || lineNumber > lines.length) {
      return;
    }

    // Remove the highlight from the line
    lines[lineNumber] = lines[lineNumber].replace(/^<mark>(.*)<\/mark>$/, "$1");
    codeElement.innerHTML = lines.join("\n");
  }

  markLineReturnUndoFunction(lineNumber) {
    return () => {
      const prevLine = this.highlightedLine;
      this.markLine(lineNumber);
      return () => {
        this.markLine(prevLine);
      };
    };
  }

  updateVariableExplorer(variables) {
    var table = document.getElementById("variables");
    const prevHTML = table.innerHTML;
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

    return prevHTML;
  }

  updateVariableExplorerReturnUndoFunction(variables) {
    // Currently, the undo portion is empty since it rewrote the entire table.
    // So, to undo it we run previous function again.
    return () => {
      const prevHTML = this.updateVariableExplorer(variables);
      return () => {
        document.getElementById("variables").innerHTML = prevHTML;
      };
    };
  }

  addArrayInputSet(name) {
    const container = document.getElementById("input-tab");

    // Create the main container
    const arrayContainer = document.createElement("div");
    arrayContainer.id = `${name}_array`;
    arrayContainer.classList.add("tab-pane", "fade");

    // Number of Rows Input
    createLabeledInput(
      arrayContainer,
      `${name}_num-rows`,
      "Number of rows:",
      "number",
      null,
      5
    );

    // Number of Columns Input
    createLabeledInput(
      arrayContainer,
      `${name}_num-columns`,
      "Number of columns:",
      "number",
      null,
      5
    );

    // Create Array Button
    createButton(
      arrayContainer,
      `${name}_createArray`,
      "Create Array",
      "btn btn-success create-btn"
    );

    // Textarea for array input
    createLabeledInput(
      arrayContainer,
      `${name}_array-input`,
      "Or Enter Array",
      "textarea"
    );

    // Append the arrayContainer to the main container
    container.appendChild(arrayContainer);
  }

  addValue(name) {
    return;
  }

  addGraph(name) {
    const container = document.getElementById("input-tab");

    // Create the main container
    const graphContainer = document.createElement("div");
    graphContainer.id = `${name}_graph`;
    graphContainer.classList.add("tab-pane", "fade", "show", "active");

    // Creation Method Select
    createLabeledInput(
      graphContainer,
      `${name}_graph-creation-method`,
      "Graph Creation Method:",
      "select",
      ["Random", "Grid", "Empty"]
    );

    // Number of Nodes Input
    createLabeledInput(
      graphContainer,
      `${name}_num-nodes`,
      "Number of Nodes:",
      "number",
      null,
      10
    );

    // Number of Edges Input
    createLabeledInput(
      graphContainer,
      `${name}_num-edges`,
      "Number of Edges:",
      "number",
      null,
      15
    );

    // Directed Checkbox
    createLabeledInput(
      graphContainer,
      `${name}_directed`,
      "Directed",
      "checkbox"
    );

    // Create Graph Button
    createButton(
      graphContainer,
      `${name}_createGraph`,
      "Create Graph",
      "btn btn-success create-btn"
    );

    // Node/Edge operation buttons
    createButton(
      graphContainer,
      `${name}_addEdge`,
      "Add Edge",
      "btn btn-primary"
    );
    createButton(
      graphContainer,
      `${name}_addNode`,
      "Add Node",
      "btn btn-primary"
    );
    createButton(
      graphContainer,
      `${name}_deleteEdge`,
      "Delete Edge",
      "btn btn-danger"
    );
    createButton(
      graphContainer,
      `${name}_deleteNode`,
      "Delete Node",
      "btn btn-danger"
    );

    // Textarea for adjacency list
    createLabeledInput(
      graphContainer,
      `${name}_adjacency-list`,
      "Or Enter Adjacency List",
      "textarea"
    );

    // Append the graphContainer to the main container
    container.appendChild(graphContainer);
  }

  createLabeledInput(
    parent,
    id,
    labelText,
    type,
    options = null,
    value = null
  ) {
    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerText = labelText;
    parent.appendChild(label);

    let input;
    if (type === "select") {
      input = document.createElement("select");
      options.forEach((optionValue) => {
        const option = document.createElement("option");
        option.value = optionValue.toLowerCase();
        option.innerText = optionValue;
        input.appendChild(option);
      });
    } else if (type === "textarea") {
      input = document.createElement("textarea");
      input.placeholder = labelText;
    } else {
      input = document.createElement("input");
      input.type = type;
      if (value !== null) {
        input.value = value;
      }
    }

    input.id = id;
    input.classList.add("form-control");
    parent.appendChild(input);
  }

  createButton(parent, id, buttonText, className) {
    const button = document.createElement("button");
    button.id = id;
    button.innerText = buttonText;
    button.className = className;
    parent.appendChild(button);
  }
}
