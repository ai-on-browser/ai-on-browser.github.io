import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

W_init = onnx.helper.make_tensor(
    name="w",
    data_type=onnx.TensorProto.FLOAT,
    dims=(10, 3),
    vals=[random.random() for i in range(30)],
)
b_init = onnx.helper.make_tensor(
    name="b",
    data_type=onnx.TensorProto.FLOAT,
    dims=(1, 3),
    vals=[random.random() for i in range(3)],
)
node = onnx.helper.make_node(
    "Gemm",
    inputs=["x", "w", "b"],
    outputs=["y"],
    alpha=1.0,
    beta=1.0,
    transA=0,
    transB=0,
)

graph_def = onnx.helper.make_graph(
    nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[W_init, b_init]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/gemm.onnx")
