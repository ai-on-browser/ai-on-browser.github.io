import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, kwargs in [
    ("shrink_hard", {"lambd": 0.5}),
    ("shrink_soft", {"bias": 1.0, "lambd": 1.0}),
    ("shrink_other", {"bias": 0.5, "lambd": 1.0}),
]:
    node = onnx.helper.make_node("Shrink", inputs=["x"], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
