import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

slope_init = onnx.helper.make_tensor(
    name="slope", data_type=onnx.TensorProto.FLOAT, dims=(), vals=[0.1]
)
node = onnx.helper.make_node("PRelu", inputs=["x", "slope"], outputs=["y"])

graph_def = onnx.helper.make_graph(
    nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[slope_init]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/prelu.onnx")
