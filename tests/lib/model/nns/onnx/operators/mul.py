import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

C_init = onnx.helper.make_tensor(
    name="c", data_type=onnx.TensorProto.FLOAT, dims=(1, 3), vals=[2] * 3
)
const_node = onnx.helper.make_node(
    "Constant", inputs=[], outputs=["const"], value=C_init
)
mul_node = onnx.helper.make_node("Mul", inputs=["x", "const"], outputs=["y"])

graph_def = onnx.helper.make_graph(
    nodes=[const_node, mul_node], name="graph", inputs=[X], outputs=[Y], initializer=[]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/mul.onnx")
