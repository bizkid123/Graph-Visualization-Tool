class Step {
  constructor(action, delay) {
    if (typeof action !== "function") {
      throw new Error("Action must be a function");
    }

    if (typeof delay !== "number") {
      throw new Error("Delay must be a number");
    }

    this.action = action;
    this.delay = delay;
  }
}

class AnimationController {
  constructor() {
    this.steps = [];
    this.undoSteps = [];
    this.currentStepIndex = 0;
    this.isPaused = true;
    this.resolveFunc = null;
    this.isFinished = false;
  }

  addStep(step) {
    if (!(step instanceof Step)) {
      throw new Error("Step must be an instance of Step");
    }

    this.steps.push(step);
    this.undoSteps.push(null);
  }

  async playAnimation() {
    while (this.currentStepIndex < this.steps.length) {
      if (this.isPaused) {
        await new Promise((resolve) => (this.resolveFunc = resolve));
      }

      let step = this.steps[this.currentStepIndex];
      let undoFunc = step.action();

      if (typeof undoFunc !== "function") {
        throw new Error("Action must return a function");
      }

      this.undoSteps[this.currentStepIndex] = undoFunc;
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      this.currentStepIndex++;

      // TODO : Refactor this to be handled by the UIController
      document.getElementById("slider").value = this.currentStepIndex;
    }
    this.isFinished = true;
  }

  pauseAnimation() {
    this.isPaused = true;
    this.resolveFunc = null;
  }

  resumeAnimation() {
    this.isPaused = false;
    if (typeof this.resolveFunc === "function") {
      this.resolveFunc();
    } else {
      this.playAnimation();
    }
  }

  playPauseAnimation() {
    if (this.isPaused) {
      this.resumeAnimation();
    } else {
      this.pauseAnimation();
    }
  }

  stepBackward() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      let undoFunc = this.undoSteps[this.currentStepIndex];
      if (typeof undoFunc === "function") {
        undoFunc();
      }
    }
    this.pauseAnimation();
  }

  stepForward() {
    if (this.currentStepIndex < this.steps.length) {
      let step = this.steps[this.currentStepIndex];
      let undoFunc = step.action();

      if (typeof undoFunc !== "function") {
        throw new Error("Action must return a function");
      }

      this.undoSteps[this.currentStepIndex] = undoFunc;
      this.currentStepIndex++;
    }
    this.pauseAnimation();
  }

  moveAnimationToStep(stepIndex) {
    if (stepIndex < this.currentStepIndex) {
      while (this.currentStepIndex > stepIndex) {
        this.stepBackward();
      }
    } else {
      while (this.currentStepIndex < stepIndex) {
        this.stepForward();
      }
    }
    this.pauseAnimation();
  }

  reset() {
    this.steps = [];
    this.undoSteps = [];
    this.currentStepIndex = 0;
    this.isPaused = true; // Resetting the animation should pause it
    this.resolveFunc = null;
    this.isFinished = false;
  }
}
