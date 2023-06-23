from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import inspect

app = Flask(__name__)
app.config["SECRET_KEY"] = "mysecretkey"
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


# On connect
@socketio.on("connect")
def init_app():
    emit("display_code", {"code": inspect.getsource(dfs)})


def highlightNode(node, color):
    return
    emit("highlight_node", {"node": node, "color": color})


@socketio.on("run_algorithm")
def run_algorithm(algorithm, args):
    # the adjacency_list is a dict where key: node, value: list of connected nodes
    adjacency_list = {int(k): [int(node) for node in v] for k, v in args[0].items()}

    startNode = args[1]

    # Get the module as text
    module_text = inspect.getsource(dfs)
    emit("display_code", {"code": module_text})

    out = debug_module(dfs, "dfs", ["graph", "start"], adjacency_list, startNode)
    for item in out:
        key, val = list(item.items())[0]
        emit(key, val)
    emit("algorithm_finished")


if __name__ == "__main__":
    import algorithms.dfs as dfs

    # from algorithms.debugger import WebDebugger
    from algorithms.debugger import debug_module

    socketio.run(app, allow_unsafe_werkzeug=True)
