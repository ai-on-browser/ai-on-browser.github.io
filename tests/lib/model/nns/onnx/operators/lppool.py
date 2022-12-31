import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 2])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 5, 5, 2])

for name, kwargs in [
    ("lppool", {"p": 2, "kernel_shape": (2, 2), "strides": (2, 2)}),
    ("lppool_different_strides", {"p": 2, "kernel_shape": (2, 2), "strides": (2, 1)}),
    (
        "lppool_auto_pad_same_upper",
        {"p": 2, "kernel_shape": (2, 2), "auto_pad": "SAME_UPPER"},
    ),
    (
        "lppool_auto_pad_same_lower",
        {"p": 2, "kernel_shape": (2, 2), "auto_pad": "SAME_LOWER"},
    ),
    ("lppool_auto_pad_valid", {"p": 2, "kernel_shape": (2, 2), "auto_pad": "VALID"}),
    (
        "lppool_auto_pad_notset",
        {"p": 2, "kernel_shape": (2, 2), "auto_pad": "NOTSET", "pads": (1, 1, 0, 0)},
    ),
]:
    node = onnx.helper.make_node("LpPool", inputs=["x"], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
