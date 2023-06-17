from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "mysecretkey"
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")


def highlightNode(node, color):
    socketio.emit("highlight_node", {"node": node, "color": color})


def dfs(graph, start):
    visited = []
    stack = [start]

    while stack:
        node = stack.pop()
        highlightNode(node, "red")
        if node not in visited:
            visited.append(node)
            for unvisited in graph[node]:
                if unvisited not in visited:
                    stack.append(unvisited)
        highlightNode(node, "green")

    return visited


@socketio.on("run_algorithm")
def run_algorithm(adjacency_list):
    # the adjacency_list is a dict where key: node, value: list of connected nodes
    adjacency_list = {int(k): [int(node) for node in v] for k, v in adjacency_list.items()}
    dfs(adjacency_list, 0)


if __name__ == "__main__":
    socketio.run(app, allow_unsafe_werkzeug=True)
