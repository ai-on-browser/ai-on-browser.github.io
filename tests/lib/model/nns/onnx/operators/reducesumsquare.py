import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, axis, kwargs in [
    ("reducesumsquare", [1], {}),
    ("reducesumsquare_not_keepdims", [1], {"keepdims": 0}),
    ("reducesumsquare_noop_with_empty_axes", [1], {"noop_with_empty_axes": 1}),
]:
    axis_init = onnx.helper.make_tensor(
        name="a",
        data_type=onnx.TensorProto.INT64,
        dims=(len(axis),),
        vals=axis,
    )

    node = onnx.helper.make_node(
        "ReduceSumSquare", inputs=["x", "a"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[axis_init]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, kwargs in [("reducesumsquare_no_axis", {})]:
    node = onnx.helper.make_node(
        "ReduceSumSquare", inputs=["x"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, axis, kwargs in [("reducesumsquare_other_node", [1], {})]:
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
        "ReduceSumSquare", inputs=["x", "axis"], outputs=["y"], **kwargs
    )

    graph_def = onnx.helper.make_graph(
        nodes=[const_node, node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
