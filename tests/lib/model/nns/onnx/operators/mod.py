import os

import onnx

X1 = onnx.helper.make_tensor_value_info("x1", onnx.TensorProto.FLOAT, [None, 3])
X2 = onnx.helper.make_tensor_value_info("x2", onnx.TensorProto.FLOAT, [None, 3])
Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [None, 3])

for name, kwargs in [
    ("mod", {}),
    ("mod_fmod", {"fmod": 1}),
]:
    node = onnx.helper.make_node("Mod", inputs=["x1", "x2"], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[X1, X2], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
