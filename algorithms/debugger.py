import sys
import inspect
from copy import deepcopy


class DebugModuleDebugger:
    def __init__(self, exclude_vars=[]):
        self.animation_info = []
        self.exclude_vars = exclude_vars

    def debug_module(self, module, function_name, *args, **kwargs):
        # self.animation_info = []
        if function_name not in dir(module):
            return
        # Get the function
        function = getattr(module, function_name)
        # Loop over all methods in the 'self' object (which should be an instance of the class)
        for method_name in dir(self):
            method = getattr(self, method_name)
            if callable(method) and getattr(method, "is_decorated", False):
                # If method is decorated, add it to the module's dictionary
                module.__dict__[method_name] = method
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
            if frame.f_code.co_name == "wrapper":
                return

        return self.trace

    def trace_decorator(func):
        def wrapper(self, *args, **kwargs):
            sys.settrace(None)
            self.animation_info.pop()
            result = func(self, *args, **kwargs)
            sys.settrace(self.trace)
            return result

        wrapper.is_decorated = True  # Add attribute to decorated function
        return wrapper

    @trace_decorator
    def highlightNode(self, node, color):
        self.animation_info.append({"highlight_node": {"node": node, "color": color}})

    @trace_decorator
    def highlightEdge(self, source, target, color):
        self.animation_info.append(
            {"highlight_edge": {"source": source, "target": target, "color": color}}
        )


def debug_module(module, function_name, exclude_vars, *args, **kwargs):
    debugger = DebugModuleDebugger(exclude_vars)
    return debugger.debug_module(module, function_name, *args, **kwargs)
