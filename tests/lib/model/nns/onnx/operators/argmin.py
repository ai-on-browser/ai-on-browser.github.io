import os

import onnx

X = onnx.helper.make_tensor_value_info("x", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 1])

for name, kwargs in [
    ("argmin", {}),
    ("argmin_axis_1", {"axis": 1}),
    ("argmin_axis_2", {"axis": 2}),
    ("argmin_select_last_index", {"select_last_index": 1}),
]:
    node = onnx.helper.make_node("ArgMin", inputs=["x"], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
