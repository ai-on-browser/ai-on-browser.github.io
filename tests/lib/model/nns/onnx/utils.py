import os

import numpy as np
import onnx

Y = onnx.helper.make_tensor_value_info("y", onnx.TensorProto.FLOAT, [1, 1])

for name, data_type, raw in [
    ("utils_tensor_floatDataList", onnx.TensorProto.FLOAT, None),
    ("utils_tensor_int32DataList", onnx.TensorProto.INT32, None),
    ("utils_tensor_int64DataList", onnx.TensorProto.INT64, None),
    ("utils_tensor_doubleDataList", onnx.TensorProto.DOUBLE, None),
    ("utils_tensor_floatDataList_raw", onnx.TensorProto.FLOAT, np.float32),
    ("utils_tensor_int8_raw", onnx.TensorProto.INT8, np.int8),
    ("utils_tensor_int16_raw", onnx.TensorProto.INT16, np.int16),
    ("utils_tensor_int32_raw", onnx.TensorProto.INT32, np.int32),
    ("utils_tensor_int64_raw", onnx.TensorProto.INT64, np.int64),
    ("utils_tensor_float16_raw", onnx.TensorProto.FLOAT16, np.float16),
    ("utils_tensor_double_raw", onnx.TensorProto.DOUBLE, np.float64),
    ("utils_tensor_complex64_raw", onnx.TensorProto.COMPLEX64, np.complex64),
    ("utils_tensor_complex128_raw", onnx.TensorProto.COMPLEX128, np.complex128),
]:
    C_init = onnx.helper.make_tensor(
        name="c",
        data_type=data_type,
        dims=(2, 2),
        vals=(
            [-1, 0, 1, 2]
            if raw is None
            else np.array([-1, 0, 1, 2], dtype=raw).tobytes()
        ),
        raw=raw is not None,
    )
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, data_type in [
    (
        "utils_tensor_bfloat16_raw",
        onnx.TensorProto.BFLOAT16,
    ),
]:
    vals = [-1, 0, 1, 2]
    C_init = onnx.helper.make_tensor(
        name="c",
        data_type=data_type,
        dims=(2, 2),
        vals=np.array(vals, dtype=np.float16).tobytes(),
        raw=True,
    )
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, data_type, raw in [
    ("utils_tensor_uint64DataList", onnx.TensorProto.UINT64, None),
    ("utils_tensor_uint8_raw", onnx.TensorProto.UINT8, np.uint8),
    ("utils_tensor_uint16_raw", onnx.TensorProto.UINT16, np.uint16),
    ("utils_tensor_bool_raw", onnx.TensorProto.BOOL, bool),
    ("utils_tensor_uint32_raw", onnx.TensorProto.UINT32, np.uint32),
    ("utils_tensor_uint64_raw", onnx.TensorProto.UINT64, np.uint64),
]:
    C_init = onnx.helper.make_tensor(
        name="c",
        data_type=data_type,
        dims=(2, 2),
        vals=(
            [0, 1, 2, 3] if raw is None else np.array([0, 1, 2, 3], dtype=raw).tobytes()
        ),
        raw=raw is not None,
    )
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, data_type, raw in [
    ("utils_tensor_stringDataList", onnx.TensorProto.STRING, None),
]:
    C_init = onnx.helper.make_tensor(
        name="c", data_type=data_type, dims=(2, 2), vals=[b"a", b"b", b"c", b"d"]
    )
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for (name,) in [
    ("utils_tensor_zerodim",),
]:
    C_init = onnx.helper.make_tensor(
        name="c", data_type=onnx.TensorProto.FLOAT, dims=(), vals=[1]
    )
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], value=C_init)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")

for name, kwargs in [
    ("utils_attribute_float", {"value_float": 1.5}),
    ("utils_attribute_int", {"value_int": 1}),
    ("utils_attribute_string", {"value_string": "str"}),
    (
        "utils_attribute_tensor",
        {
            "value": onnx.helper.make_tensor(
                name="c", data_type=onnx.TensorProto.FLOAT, dims=(1,), vals=[1]
            )
        },
    ),
    (
        "utils_attribute_sparse_tensor",
        {
            "sparse_value": onnx.helper.make_sparse_tensor(
                values=onnx.helper.make_tensor(
                    name="values",
                    data_type=onnx.TensorProto.FLOAT,
                    dims=(1,),
                    vals=[1.0],
                ),
                indices=onnx.helper.make_tensor(
                    name="indices",
                    data_type=onnx.TensorProto.INT64,
                    dims=(1, 2),
                    vals=[0, 1],
                ),
                dims=[2, 3],
            )
        },
    ),
    ("utils_attribute_floats", {"value_floats": [1.5, 2.25]}),
    ("utils_attribute_ints", {"value_ints": [1, 2]}),
    ("utils_attribute_strings", {"value_strings": ["str", "ing"]}),
]:
    node = onnx.helper.make_node("Constant", inputs=[], outputs=["y"], **kwargs)

    graph_def = onnx.helper.make_graph(
        nodes=[node], name="graph", inputs=[], outputs=[Y], initializer=[]
    )
    model_def = onnx.helper.make_model(graph_def, producer_name="onnx-example")
    onnx.checker.check_model(model_def)

    onnx.save(model_def, f"{os.path.dirname(__file__)}/{name}.onnx")
