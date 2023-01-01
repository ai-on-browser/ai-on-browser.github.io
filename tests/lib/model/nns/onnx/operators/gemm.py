import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, w_shape, b_shape, kwargs in [
    ("gemm", (10, 3), (1, 3), {}),
    (
        "gemm_attrs",
        (10, 3),
        (1, 3),
        {"alpha": 1.0, "beta": 1.0, "transA": 0, "transB": 0},
    ),
    ("gemm_transA_1", (10, 3), (1, 3), {"transA": 1}),
    ("gemm_transB_1", (3, 10), (1, 3), {"transB": 1}),
    ("gemm_1D_bias", (10, 3), (3,), {}),
]:
    W_init = onnx.helper.make_tensor(
        name="w",
        data_type=onnx.TensorProto.FLOAT,
        dims=w_shape,
        vals=[random.random() for i in range(w_shape[0] * w_shape[1])],
    )
    b_init = onnx.helper.make_tensor(
        name="b",
        data_type=onnx.TensorProto.FLOAT,
        dims=b_shape,
        vals=[
            random.random()
            for i in range(b_shape[0] * b_shape[1] if len(b_shape) == 2 else b_shape[0])
        ],
    )
    node = onnx.helper.make_node(
        "Gemm", inputs=["x", "w", "b"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node],
        name="graph",
        inputs=[X],
        outputs=[Y],
        initializer=[W_init, b_init],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
