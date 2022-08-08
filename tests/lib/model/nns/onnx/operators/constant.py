import os

import onnx

Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [1, 1])

C_init = onnx.helper.make_tensor(
    name="c", data_type=onnx.TensorProto.FLOAT, dims=(1, 1), vals=[1]
)
node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

graph_def = onnx.helper.make_graph(
    nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
)
model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
onnx.checker.check_model(model_def)

onnx.save(model_def, f"{os.path.dirname(__file__)}/constant.onnx")
