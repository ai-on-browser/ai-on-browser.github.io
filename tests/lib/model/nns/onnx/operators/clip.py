import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, kwargs in [
    ("clip", {"min": 0, "max": 1}),
    ("clip_min", {"min": 0}),
    ("clip_max", {"max": 0}),
]:
    inputs = ["x"]
    initializer = []
    if "min" in kwargs:
        min_init = onnx.helper.make_tensor(
            name="min",
            data_type=onnx.TensorProto.FLOAT,
            dims=[],
            vals=[kwargs["min"]],
        )
        initializer.append(min_init)
        inputs.append("min")
    else:
        inputs.append("")
    if "max" in kwargs:
        max_init = onnx.helper.make_tensor(
            name="max",
            data_type=onnx.TensorProto.FLOAT,
            dims=[],
            vals=[kwargs["max"]],
        )
        initializer.append(max_init)
        inputs.append("max")
    else:
        inputs.append("")
    node = onnx.helper.make_node("Clip", inputs=inputs, outputs=["y"])

    graph_def = onnx.helper.make_graph(
        nodes=[node],
        name="graph",
        inputs=[X],
        outputs=[Y],
        initializer=initializer,
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, kwargs in [("clip_other_node", {})]:
    min_init = onnx.helper.make_tensor(
        name="min",
        data_type=onnx.TensorProto.FLOAT,
        dims=[],
        vals=[0],
    )
    min_node = onnx.helper.make_node(
        "Constant", inputs=[], outputs=["min"], value=min_init
    )
    max_init = onnx.helper.make_tensor(
        name="max",
        data_type=onnx.TensorProto.FLOAT,
        dims=[],
        vals=[1],
    )
    max_node = onnx.helper.make_node(
        "Constant", inputs=[], outputs=["max"], value=max_init
    )
    node = onnx.helper.make_node("Clip", inputs=["x", "min", "max"], outputs=["y"])

    graph_def = onnx.helper.make_graph(
        nodes=[min_node, max_node, node],
        name="graph",
        inputs=[X],
        outputs=[Y],
        initializer=[],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
