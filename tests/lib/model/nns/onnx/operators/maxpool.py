import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 2])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 5, 5, 2])

for name, kwargs in [
    ("maxpool", {"kernel_shape": (2, 2), "strides": (2, 2)}),
    ("maxpool_different_strides", {"kernel_shape": (2, 2), "strides": (2, 1)}),
    (
        "maxpool_auto_pad_same_upper",
        {"kernel_shape": (2, 2), "auto_pad": "SAME_UPPER"},
    ),
    (
        "maxpool_auto_pad_same_lower",
        {"kernel_shape": (2, 2), "auto_pad": "SAME_LOWER"},
    ),
    ("maxpool_auto_pad_valid", {"kernel_shape": (2, 2), "auto_pad": "VALID"}),
    (
        "maxpool_auto_pad_notset",
        {"kernel_shape": (2, 2), "auto_pad": "NOTSET", "pads": (1, 1, 0, 0)},
    ),
]:
    node = onnx.helper.make_node("MaxPool", inputs=["x"], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
