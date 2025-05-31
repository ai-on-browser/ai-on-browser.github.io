import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.INT64, [2])

for name, kwargs in [
    ("shape", {}),
    ("shape_with_start_0", {"start": 0}),
    ("shape_with_start_-1", {"start": -1}),
    ("shape_with_end_0", {"end": 0}),
]:
    node = onnx.helper.make_node("Shape", inputs=["x"], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
