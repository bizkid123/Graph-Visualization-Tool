import sys
import inspect
from copy import deepcopy


class DebugModuleDebugger:
    def __init__(self, exclude_vars=[]):
        self.animation_info = []
        self.exclude_vars = exclude_vars

    def debug_module(self, module, function_name, *args, **kwargs):
        if function_name not in dir(module):
            return

        # Get the function
        function = getattr(module, function_name)

        module.__dict__["highlightNode"] = self.highlightNode
        module.__dict__["highlightEdge"] = self.highlightEdge

        # Execute the code line by line
        try:
            sys.settrace(self.trace)
            function(*args, **kwargs)
        finally:
            sys.settrace(None)

        return self.animation_info

    def trace(self, frame, event, arg):
        if event == "line":
            current_locals = frame.f_locals
            current_line = frame.f_lineno

            self.animation_info.append(
                {
                    "new_line": {
                        "lineNumber": current_line,
                        "variables": {
                            k: deepcopy(v)
                            for k, v in current_locals.items()
                            if k not in self.exclude_vars
                        },
                    }
                }
            )
        if event == "call":
            if frame.f_code.co_name == "highlightNode":
                return  # Do nothing for highlightNode calls
            elif frame.f_code.co_name == "highlightEdge":
                return

        return self.trace

    def highlightNode(self, node, color):
        # Disable tracing
        sys.settrace(None)
        self.animation_info.pop()
        self.animation_info.append({"highlight_node": {"node": node, "color": color}})
        sys.settrace(self.trace)

    def highlightEdge(self, source, target, color):
        sys.settrace(None)
        self.animation_info.pop()
        self.animation_info.append(
            {"highlight_edge": {"source": source, "target": target, "color": color}}
        )
        sys.settrace(self.trace)


def debug_module(module, function_name, exclude_vars, *args, **kwargs):
    debugger = DebugModuleDebugger(exclude_vars)
    return debugger.debug_module(module, function_name, *args, **kwargs)
