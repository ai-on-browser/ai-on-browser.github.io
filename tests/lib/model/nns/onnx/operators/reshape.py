import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [10, None])

for name, kwargs in [
    ("reshape", {"dims": (2,), "vals": [-1, 10]}),
    ("reshape_no_neg", {"dims": (2,), "vals": [2, 5]}),
    ("reshape_vals_mid_neg", {"dims": (2,), "vals": [10, -1]}),
]:
    shape = onnx.helper.make_tensor(
        name="shape", data_type=onnx.TensorProto.FLOAT, **kwargs
    )
    node = onnx.helper.make_node(
        "Reshape", inputs=["x", "shape"], outputs=["y"], allowzero=0
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[shape]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
