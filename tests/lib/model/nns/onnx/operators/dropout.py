import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, ratio, mode, kwargs in [
    ("dropout", None, None, {}),
    ("dropout_ratio", 0.75, None, {}),
    ("dropout_ignore_seed", None, None, {"seed": 1}),
    ("dropout_ignore_trainig_mode", None, True, {}),
]:
    inputs = ["x"]
    initializer = []
    if ratio is not None:
        ratio_init = onnx.helper.make_tensor(
            name="ratio",
            data_type=onnx.TensorProto.FLOAT,
            dims=(),
            vals=[ratio],
        )
        inputs.append("ratio")
        initializer.append(ratio_init)
    if mode is not None:
        mode_init = onnx.helper.make_tensor(
            name="training_mode",
            data_type=onnx.TensorProto.BOOL,
            dims=(),
            vals=[mode],
        )
        if len(inputs) == 1:
            inputs.append("")
        inputs.append("training_mode")
        initializer.append(mode_init)
    node = onnx.helper.make_node("Dropout", inputs=inputs, outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=initializer
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, ratio, mode, kwargs in [
    ("dropout_dummy_init", None, None, {}),
]:
    inputs = ["x"]
    initializer = []
    if ratio is not None:
        ratio_init = onnx.helper.make_tensor(
            name="ratio",
            data_type=onnx.TensorProto.FLOAT,
            dims=(),
            vals=[ratio],
        )
        inputs.append("ratio")
        initializer.append(ratio_init)
    if mode is not None:
        mode_init = onnx.helper.make_tensor(
            name="training_mode",
            data_type=onnx.TensorProto.BOOL,
            dims=(),
            vals=[mode],
        )
        if len(inputs) == 1:
            inputs.append("")
        inputs.append("training_mode")
        initializer.append(mode_init)
    node = onnx.helper.make_node("Dropout", inputs=inputs, outputs=["y"], **kwargs)

    dummy_init = onnx.helper.make_tensor(
        name="dummy",
        data_type=onnx.TensorProto.FLOAT,
        dims=[],
        vals=[0],
    )
    initializer.append(dummy_init)
    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=initializer
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
