import os

import onnx

Cond = onnx.helper.make_tensor_value_info("condition", onnx.TensorProto.BOOL, [None, 3])
X1 = onnx.helper.make_tensor_value_info("x1", onnx.TensorProto.FLOAT, [None, 3])
X2 = onnx.helper.make_tensor_value_info("x2", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

less_node = onnx.helper.make_node(
    "Where", inputs=["condition", "x1", "x2"], outputs=["y"]
)

graph_def = onnx.helper.make_graph(
    nodes=[less_node], name="graph", inputs=[Cond, X1, X2], outputs=[Y], initializer=[]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/where.onnx")
