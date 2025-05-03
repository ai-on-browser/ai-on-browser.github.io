import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, axis, kwargs in [
    ("reducelogsumexp", [1], {}),
    ("reducelogsumexp_not_keepdims", [1], {"keepdims": 0}),
    ("reducelogsumexp_noop_with_empty_axes", [1], {"noop_with_empty_axes": 1}),
]:
    axis_init = onnx.helper.make_tensor(
        name="a",
        data_type=onnx.TensorProto.INT64,
        dims=(len(axis),),
        vals=axis,
    )

    node = onnx.helper.make_node(
        "ReduceLogSumExp", inputs=["x", "a"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[axis_init]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, kwargs in [("reducelogsumexp_no_axis", {})]:
    node = onnx.helper.make_node(
        "ReduceLogSumExp", inputs=["x"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, axis, kwargs in [("reducelogsumexp_dummy_init", [1], {})]:
    axis_init = onnx.helper.make_tensor(
        name="a",
        data_type=onnx.TensorProto.INT64,
        dims=(len(axis),),
        vals=axis,
    )

    node = onnx.helper.make_node(
        "ReduceLogSumExp", inputs=["x", "a"], outputs=["y"], **kwargs
    )

    dummy_init = onnx.helper.make_tensor(
        name="dummy",
        data_type=onnx.TensorProto.FLOAT,
        dims=[],
        vals=[0],
    )
    graph_def = onnx.helper.make_graph(
        nodes=[node],
        name="graph",
        inputs=[X],
        outputs=[Y],
        initializer=[axis_init, dummy_init],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, axis, kwargs in [("reducelogsumexp_other_node", [1], {})]:
    C_init = onnx.helper.make_tensor(
        name="c",
        data_type=onnx.TensorProto.FLOAT,
        dims=(len(axis),),
        vals=axis,
    )
    const_node = onnx.helper.make_node(
        "Constant", inputs=[], outputs=["axis"], value=C_init
    )
    node = onnx.helper.make_node(
        "ReduceLogSumExp", inputs=["x", "axis"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[const_node, node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
