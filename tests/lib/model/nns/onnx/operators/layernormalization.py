import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 10, 10, 2])

for name, kwargs in [
    ("layernormalization", {}),
]:
    csize = 3
    scale_init = onnx.helper.make_tensor(
        name="scale",
        data_type=onnx.TensorProto.FLOAT,
        dims=(csize,),
        vals=[random.random() for i in range(csize)],
    )
    b_init = onnx.helper.make_tensor(
        name="b",
        data_type=onnx.TensorProto.FLOAT,
        dims=(csize,),
        vals=[random.random() for i in range(csize)],
    )

    node = onnx.helper.make_node(
        "LayerNormalization",
        inputs=["x", "scale", "b"],
        outputs=["y"],
        **kwargs,
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node],
        name="graph",
        inputs=[X],
        outputs=[Y],
        initializer=[scale_init, b_init],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
