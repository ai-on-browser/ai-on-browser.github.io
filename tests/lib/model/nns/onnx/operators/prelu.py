import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, slope_shape in [("prelu", ()), ("prelu_slope_array", (3,))]:
    slope_length = 1
    for slope_size in slope_shape:
        slope_length *= slope_size
    slope_init = onnx.helper.make_tensor(
        name="slope",
        data_type=onnx.TensorProto.FLOAT,
        dims=slope_shape,
        vals=[0.1] * slope_length,
    )
    node = onnx.helper.make_node("PRelu", inputs=["x", "slope"], outputs=["y"])

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[slope_init]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, slope_shape in [("prelu_dummy_init", ())]:
    slope_length = 1
    for slope_size in slope_shape:
        slope_length *= slope_size
    slope_init = onnx.helper.make_tensor(
        name="slope",
        data_type=onnx.TensorProto.FLOAT,
        dims=slope_shape,
        vals=[0.1] * slope_length,
    )
    node = onnx.helper.make_node("PRelu", inputs=["x", "slope"], outputs=["y"])

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
        initializer=[dummy_init, slope_init],
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, slope_shape in [("prelu_other_node", ())]:
    slope_length = 1
    for slope_size in slope_shape:
        slope_length *= slope_size
    C_init = onnx.helper.make_tensor(
        name="c",
        data_type=onnx.TensorProto.FLOAT,
        dims=slope_shape,
        vals=[0.1] * slope_length,
    )
    const_node = onnx.helper.make_node(
        "Constant", inputs=[], outputs=["slope"], value=C_init
    )
    node = onnx.helper.make_node("PRelu", inputs=["x", "slope"], outputs=["y"])

    graph_def = onnx.helper.make_graph(
        nodes=[const_node, node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
