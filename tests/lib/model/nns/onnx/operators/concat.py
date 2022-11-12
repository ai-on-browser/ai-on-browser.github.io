import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

C_init = onnx.helper.make_tensor(
    name="c", data_type=onnx.TensorProto.FLOAT, dims=(20, 1), vals=[1] * 20
)
const_node = onnx.helper.make_node(
    "Constant", inputs=[], outputs=["const"], value=C_init
)
concat_node = onnx.helper.make_node(
    "Concat", inputs=["x", "const"], outputs=["y"], axis=1
)

graph_def = onnx.helper.make_graph(
    nodes=[const_node, concat_node],
    name="graph",
    inputs=[X],
    outputs=[Y],
    initializer=[],
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/concat.onnx")
