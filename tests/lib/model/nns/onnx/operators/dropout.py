import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, ratio, kwargs in [
    ("dropout", None, {}),
    ("dropout_ratio", 0.75, {}),
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
    node = onnx.helper.make_node("Dropout", inputs=inputs, outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=initializer
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
