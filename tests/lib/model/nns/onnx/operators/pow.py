import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, exponent_shape in [("pow", ()), ("pow_exponent_array", (3,))]:
    exponent_length = 1
    for exponent_size in exponent_shape:
        exponent_length *= exponent_size
    exponent_init = onnx.helper.make_tensor(
        name="exponent",
        data_type=onnx.TensorProto.FLOAT,
        dims=exponent_shape,
        vals=[2] * exponent_length,
    )
    node = onnx.helper.make_node("Pow", inputs=["x", "exponent"], outputs=["y"])

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[exponent_init]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
