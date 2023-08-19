import os

import onnx

Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [1, 1])

for name, data_type, shape, values in [
    ("constant_0d", onnx.TensorProto.FLOAT, (), [1]),
    ("constant", onnx.TensorProto.FLOAT, (1, 1), [1]),
]:
    C_init = onnx.helper.make_tensor(
        name="c", data_type=data_type, dims=shape, vals=values
    )
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, data_type, values, indices, dims in [
    ("constant_sparse_tensor", onnx.TensorProto.FLOAT, [1.0], [0, 1], [2, 3]),
]:
    val = onnx.helper.make_tensor(
        name="values", data_type=data_type, dims=(len(values),), vals=values
    )
    idx = onnx.helper.make_tensor(
        name="indices",
        data_type=onnx.TensorProto.INT64,
        dims=(len(indices) // len(dims), len(dims)),
        vals=indices,
    )
    C_init = onnx.helper.make_sparse_tensor(values=val, indices=idx, dims=dims)
    node = onnx.helper.make_node(
        "Constant", inputs=[], outputs=["y"], sparse_value=C_init
    )

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, kwargs in [
    ("constant_float", {"value_float": 1.2}),
    ("constant_floats", {"value_floats": [1.2, 3.4]}),
    ("constant_int", {"value_int": 1}),
    ("constant_ints", {"value_ints": [1, 2]}),
    ("constant_string", {"value_string": "str"}),
    ("constant_strings", {"value_strings": ["str", "ing"]}),
]:
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
