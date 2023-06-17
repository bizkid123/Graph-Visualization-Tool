from flask import Blueprint, request, jsonify
from algorithms.dfs import dfs

blueprint = Blueprint('api', __name__)

@blueprint.route('/run_algorithm', methods=['POST'])
def run_algorithm():
    n = int(request.json['n'])
    graph = {i: [i + 1] for i in range(n - 1)}  # A simple path graph
    graph[n - 1] = []
    sequence = dfs(graph, 0)
    return jsonify(sequence)
