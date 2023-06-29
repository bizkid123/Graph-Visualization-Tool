class ServerEmitter {
  constructor(socket, graphController) {
    this.socket = socket;
    this.graphController = graphController;
  }

  emitRunAlgorithm() {
    const algorithm = document.getElementById("algorithm").value;
    const params = [this.graphController.getGraph(), 0];
    this.socket.emit("run_algorithm", algorithm, params);
  }
}

class ServerReceiver {
  constructor(socket, graphController, animationController, UIController) {
    this.socket = socket;
    this.graphController = graphController;
    this.animationController = animationController;
    this.UIController = UIController;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on("display_code", this.displayCode.bind(this));

    this.socket.on("highlight_node", (msg) => {
      //   this.graphController.highlightNodeReturnUndoFunction(msg.node, msg.color);
      const step = new Step(
        this.graphController.highlightNodeReturnUndoFunction(
          msg.node,
          msg.color
        ),
        20
      );
      this.animationController.addStep(step);
    });

    this.socket.on("highlight_edge", (msg) => {
      const step = new Step(
        this.graphController.highlightEdgeReturnUndoFunction(
          msg.source,
          msg.target,
          msg.color
        ),
        20
      );
      this.animationController.addStep(step);
    });

    this.socket.on("new_line", (msg) => {
      const step = new Step(
        this.UIController.progressLineReturnUndoFunction(
          msg.lineNumber,
          msg.variables
        ),
        20
      );
      this.animationController.addStep(step);
    });

    this.socket.on(
      "algorithm_finished",
      this.handleAlgorithmFinished.bind(this)
    );
  }

  displayCode(msg) {
    var formatted_code = Prism.highlight(
      msg.code,
      Prism.languages.python,
      "python"
    );
    document.getElementById("code").innerHTML = formatted_code;
  }

  handleAlgorithmFinished(msg) {
    document.getElementById("slider").disabled = false;
    document.getElementById("play-pause").disabled = false;
    document.getElementById("step-forward").disabled = false;
    document.getElementById("step-backward").disabled = false;

    document.getElementById("slider").max =
      this.animationController.steps.length - 1;

    this.animationController.currentStep = 0;
  }
}
