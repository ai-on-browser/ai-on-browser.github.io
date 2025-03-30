import os
import random

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 10, 10, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 10, 10, 2])

for name, w_shape, b_shape, kwargs in [
    ("conv", (2, 3, 5, 5), None, {"pads": (2, 2, 2, 2)}),
    ("conv_kernel_shape", (2, 3, 5, 5), None, {"kernel_shape": (5, 5)}),
    ("conv_bias", (2, 3, 5, 5), (10, 10), {"pads": (2, 2, 2, 2)}),
    ("conv_group_2", (2, 3, 5, 5), None, {"group": 2}),
    ("conv_different_pads", (2, 3, 5, 5), None, {"pads": (2, 2, 1, 1)}),
    ("conv_same_strides", (2, 3, 5, 5), None, {"strides": (2, 2)}),
    ("conv_different_strides", (2, 3, 5, 5), None, {"strides": (2, 1)}),
    (
        "conv_auto_pad_same_upper",
        (2, 3, 5, 5),
        None,
        {"auto_pad": "SAME_UPPER"},
    ),
    (
        "conv_auto_pad_same_lower",
        (2, 3, 5, 5),
        None,
        {"auto_pad": "SAME_LOWER"},
    ),
    ("conv_auto_pad_valid", (2, 3, 5, 5), None, {"auto_pad": "VALID"}),
    (
        "conv_auto_pad_notset",
        (2, 3, 5, 5),
        None,
        {"auto_pad": "NOTSET", "pads": (2, 2, 2, 2)},
    ),
]:
    inputs = ["x", "w"]
    w_length = 1
    for w_size in w_shape:
        w_length *= w_size
    W_init = onnx.helper.make_tensor(
        name="w",
        data_type=onnx.TensorProto.FLOAT,
        dims=w_shape,
        vals=[random.random() for i in range(w_length)],
    )
    initializer = [W_init]

    if b_shape is not None:
        b_length = 1
        for b_size in b_shape:
            b_length *= b_size
        b_init = onnx.helper.make_tensor(
            name="b",
            data_type=onnx.TensorProto.FLOAT,
            dims=b_shape,
            vals=[random.random() for i in range(b_length)],
        )
        inputs.append("b")
        initializer.append(b_init)

    node = onnx.helper.make_node("Conv", inputs=inputs, outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=initializer
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, w_shape, b_shape, kwargs in [
    ("conv_dummy_init", (2, 3, 5, 5), None, {"pads": (2, 2, 2, 2)}),
]:
    inputs = ["x", "w"]
    w_length = 1
    for w_size in w_shape:
        w_length *= w_size
    W_init = onnx.helper.make_tensor(
        name="w",
        data_type=onnx.TensorProto.FLOAT,
        dims=w_shape,
        vals=[random.random() for i in range(w_length)],
    )
    initializer = [W_init]

    if b_shape is not None:
        b_length = 1
        for b_size in b_shape:
            b_length *= b_size
        b_init = onnx.helper.make_tensor(
            name="b",
            data_type=onnx.TensorProto.FLOAT,
            dims=b_shape,
            vals=[random.random() for i in range(b_length)],
        )
        inputs.append("b")
        initializer.append(b_init)

    node = onnx.helper.make_node("Conv", inputs=inputs, outputs=["y"], **kwargs)

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

for name, w_shape, b_shape, kwargs in [
    ("conv_other_node", (2, 3, 5, 5), None, {"pads": (2, 2, 2, 2)}),
]:
    inputs = ["x", "w"]
    w_length = 1
    for w_size in w_shape:
        w_length *= w_size
    W_init = onnx.helper.make_tensor(
        name="w",
        data_type=onnx.TensorProto.FLOAT,
        dims=w_shape,
        vals=[random.random() for i in range(w_length)],
    )
    w_node = onnx.helper.make_node("Constant", inputs=[], outputs=["w"], value=W_init)
    nodes = [w_node]

    if b_shape is not None:
        b_length = 1
        for b_size in b_shape:
            b_length *= b_size
        b_init = onnx.helper.make_tensor(
            name="b",
            data_type=onnx.TensorProto.FLOAT,
            dims=b_shape,
            vals=[random.random() for i in range(b_length)],
        )
        b_node = onnx.helper.make_node(
            "Constant", inputs=[], outputs=["b"], value=b_init
        )
        inputs.append("b")
        nodes.append(b_node)

    node = onnx.helper.make_node("Conv", inputs=inputs, outputs=["y"], **kwargs)
    nodes.append(node)

    graph_def = onnx.helper.make_graph(
        nodes=nodes, name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
