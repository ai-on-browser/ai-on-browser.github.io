import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 10, 10, 2])

W_init = onnx.helper.make_tensor(
    name="w",
    data_type=onnx.TensorProto.FLOAT,
    dims=(2, 3, 5, 5),
    vals=[random.random() for i in range(150)],
)
node = onnx.helper.make_node("Conv", inputs=["x", "w"], outputs=["y"], pads=(2, 2))

graph_def = onnx.helper.make_graph(
    nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[W_init]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/conv.onnx")
