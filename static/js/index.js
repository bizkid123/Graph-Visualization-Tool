// Create instances of the classes
const animationController = new AnimationController();
const graphController = new GraphController();

socket = io.connect("http://" + document.domain + ":" + location.port);
const serverEmitter = new ServerEmitter(socket, graphController);

// Configure the UI interactions
const uiController = new UIController(
  graphController,
  animationController,
  serverEmitter
);

const serverReceiver = new ServerReceiver(
  socket,
  graphController,
  animationController,
  uiController
);
