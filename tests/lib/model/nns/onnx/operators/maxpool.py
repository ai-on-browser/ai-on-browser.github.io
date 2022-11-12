import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 2])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 5, 5, 2])

node = onnx.helper.make_node(
    "MaxPool", inputs=["x"], outputs=["y"], kernel_shape=(2, 2), strides=(2, 2)
)

graph_def = onnx.helper.make_graph(
    nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/maxpool.onnx")
