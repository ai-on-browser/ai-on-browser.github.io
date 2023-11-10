import math
import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 10, 10, 2])

for other_node in [False, True]:
    for name, csize, kwargs in [
        ("layernormalization", (3,), {}),
        ("layernormalization_axis_1", (10, 10, 3), {"axis": 1}),
        ("layernormalization_epsilon_1", (3,), {"epsilon": 1.0e-8}),
    ]:
        scale_init = onnx.helper.make_tensor(
            name="scale",
            data_type=onnx.TensorProto.FLOAT,
            dims=csize,
            vals=[random.random() for i in range(math.prod(csize))],
        )
        b_init = onnx.helper.make_tensor(
            name="b",
            data_type=onnx.TensorProto.FLOAT,
            dims=csize,
            vals=[random.random() for i in range(math.prod(csize))],
        )

        if other_node:
            name = name[:18] + "_other_node" + name[18:]
            scale_node = onnx.helper.make_node(
                "Constant", inputs=[], outputs=["scale"], value=scale_init
            )
            b_node = onnx.helper.make_node(
                "Constant", inputs=[], outputs=["b"], value=b_init
            )
            node = onnx.helper.make_node(
                "LayerNormalization",
                inputs=["x", "scale", "b"],
                outputs=["y"],
                **kwargs,
            )
            nodes = [scale_node, b_node, node]
            initializer = []
        else:
            node = onnx.helper.make_node(
                "LayerNormalization",
                inputs=["x", "scale", "b"],
                outputs=["y"],
                **kwargs,
            )
            nodes = [node]
            initializer = [scale_init, b_init]

        graph_def = onnx.helper.make_graph(
            nodes=nodes,
            name="graph",
            inputs=[X],
            outputs=[Y],
            initializer=initializer,
        )
        model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
        onnx.checker.check_model(model_def)

        onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
