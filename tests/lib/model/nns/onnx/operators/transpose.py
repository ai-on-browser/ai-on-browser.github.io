import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [10, None])

node = onnx.helper.make_node("Transpose", inputs=["x"], outputs=["y"], perm=(1, 0))

graph_def = onnx.helper.make_graph(
    nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/transpose.onnx")
