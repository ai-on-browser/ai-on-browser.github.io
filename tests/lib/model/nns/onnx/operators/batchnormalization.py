import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 10, 10, 2])

for name, kwargs in [
    ("batchnormalization", {}),
    ("batchnormalization_training_mode", {"training_mode": 1}),
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
    in_mean_init = onnx.helper.make_tensor(
        name="in_mean",
        data_type=onnx.TensorProto.FLOAT,
        dims=(csize,),
        vals=[random.random() for i in range(csize)],
    )
    in_var_init = onnx.helper.make_tensor(
        name="in_var",
        data_type=onnx.TensorProto.FLOAT,
        dims=(csize,),
        vals=[random.random() for i in range(csize)],
    )

    node = onnx.helper.make_node(
        "BatchNormalization",
        inputs=["x", "scale", "b", "in_mean", "in_var"],
        outputs=["y"],
        **kwargs,
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node],
        name="graph",
        inputs=[X],
        outputs=[Y],
        initializer=[scale_init, b_init, in_mean_init, in_var_init],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, outputs in [
    ("batchnormalization_multioutput", ["y", "mean", "var"]),
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
    in_mean_init = onnx.helper.make_tensor(
        name="in_mean",
        data_type=onnx.TensorProto.FLOAT,
        dims=(csize,),
        vals=[random.random() for i in range(csize)],
    )
    in_var_init = onnx.helper.make_tensor(
        name="in_var",
        data_type=onnx.TensorProto.FLOAT,
        dims=(csize,),
        vals=[random.random() for i in range(csize)],
    )

    node = onnx.helper.make_node(
        "BatchNormalization",
        inputs=["x", "scale", "b", "in_mean", "in_var"],
        outputs=outputs,
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node],
        name="graph",
        inputs=[X],
        outputs=[
            Y,
            *[
                onnx.helper.make_tensor_value_info(
                    name, onnx.TensorProto.FLOAT, [csize]
                )
                for name in outputs[1:]
            ],
        ],
        initializer=[scale_init, b_init, in_mean_init, in_var_init],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
