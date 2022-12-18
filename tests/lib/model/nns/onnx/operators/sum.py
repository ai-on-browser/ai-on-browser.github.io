import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

C_init1 = onnx.helper.make_tensor(
    name="c1", data_type=onnx.TensorProto.FLOAT, dims=(1, 3), vals=[1] * 3
)
const_node1 = onnx.helper.make_node(
    "Constant", inputs=[], outputs=["const1"], value=C_init1
)
C_init2 = onnx.helper.make_tensor(
    name="c2", data_type=onnx.TensorProto.FLOAT, dims=(1, 3), vals=[2] * 3
)
const_node2 = onnx.helper.make_node(
    "Constant", inputs=[], outputs=["const2"], value=C_init2
)
sum_node = onnx.helper.make_node("Sum", inputs=["x", "const1", "const2"], outputs=["y"])

graph_def = onnx.helper.make_graph(
    nodes=[const_node1, const_node2, sum_node],
    name="graph",
    inputs=[X],
    outputs=[Y],
    initializer=[],
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/sum.onnx")
