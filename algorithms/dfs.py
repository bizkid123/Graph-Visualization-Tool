from app import highlightNode


def dfs(graph, start):
    visited = []
    stack = [start]

    while stack:
        node = stack.pop()
        # highlightNode(node, "orange")
        if node not in visited:
            highlightNode(node, "yellow")
            visited.append(node)
            for unvisited in graph[node]:
                if unvisited not in visited:
                    stack.append(unvisited)
            highlightNode(node, "green")

    return visited
