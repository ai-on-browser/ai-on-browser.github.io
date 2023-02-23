import fs from 'fs'
import path from 'path'
import url from 'url'

import onnx from '../../../../../lib/model/nns/onnx/onnx_pb'
import ONNXImporter from '../../../../../lib/model/nns/onnx/onnx_importer'
import { loadTensor } from '../../../../../lib/model/nns/onnx/utils'
import Tensor from '../../../../../lib/util/tensor.js'
import { InputLayer, OutputLayer } from '../../../../../lib/model/nns/layer'
import ComputationalGraph from '../../../../../lib/model/nns/graph'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))
const onnxBackendTestPath = filepath + '/../../../../../onnx_tmp/onnx/onnx/backend/test'

const testTargets = {
	node: [
		'test_abs',
		'test_acos',
		'test_acos_example',
		'test_acosh',
		'test_acosh_example',
		'test_add',
		'test_add_bcast',
		'test_add_uint8',
		'test_and_bcast3v1d',
		'test_and_bcast3v2d',
		'test_and_bcast4v2d',
		'test_and_bcast4v3d',
		'test_and_bcast4v4d',
		'test_and2d',
		'test_and3d',
		'test_and4d',
		'test_asin',
		'test_asin_example',
		'test_asinh',
		'test_asinh_example',
		'test_atan',
		'test_atan_example',
		'test_atanh',
		'test_atanh_example',
		'test_averagepool_1d_default',
		'test_averagepool_2d_ceil',
		'test_averagepool_2d_default',
		'test_averagepool_2d_pads',
		'test_averagepool_2d_precomputed_pads',
		'test_averagepool_2d_precomputed_same_upper',
		'test_averagepool_2d_strides',
		'test_averagepool_3d_default',
		'test_bitwise_and_i16_3d',
		'test_bitwise_and_i32_2d',
		'test_bitwise_and_ui8_bcast_4v3d',
		'test_bitwise_not_2d',
		'test_bitwise_or_i16_4d',
		'test_bitwise_or_i32_2d',
		'test_bitwise_or_ui8_bcast_4v3d',
		'test_bitwise_xor_i16_3d',
		'test_bitwise_xor_i32_2d',
		'test_bitwise_xor_ui8_bcast_4v3d',
		'test_ceil',
		'test_ceil_example',
		'test_celu',
		'test_concat_1d_axis_0',
		'test_concat_2d_axis_0',
		'test_concat_2d_axis_1',
		'test_concat_3d_axis_0',
		'test_concat_3d_axis_1',
		'test_concat_3d_axis_2',
		'test_constant',
		'test_cos',
		'test_cos_example',
		'test_cosh',
		'test_cosh_example',
		'test_div',
		'test_div_bcast',
		'test_div_example',
		'test_elu',
		'test_elu_default',
		'test_elu_example',
		'test_equal',
		'test_equal_bcast',
		'test_erf',
		'test_exp',
		'test_exp_example',
		'test_flatten_axis1',
		'test_floor',
		'test_floor_example',
		'test_globalaveragepool',
		'test_globalaveragepool_precomputed',
		'test_globalmaxpool',
		'test_globalmaxpool_precomputed',
		'test_greater',
		'test_greater_bcast',
		'test_greater_equal',
		'test_greater_equal_bcast',
		'test_hardsigmoid',
		'test_hardsigmoid_default',
		'test_hardsigmoid_example',
		'test_hardswish',
		'test_identity',
		'test_isinf',
		'test_isnan',
		'test_leakyrelu',
		'test_leakyrelu_default',
		'test_leakyrelu_example',
		'test_less',
		'test_less_bcast',
		'test_less_equal',
		'test_less_equal_bcast',
		'test_log',
		'test_log_example',
		'test_matmul_2d',
		'test_max_example',
		'test_max_float16',
		'test_max_float32',
		'test_max_float64',
		'test_max_int8',
		'test_max_int16',
		'test_max_int32',
		'test_max_int64',
		'test_max_one_input',
		'test_max_two_inputs',
		'test_max_uint8',
		'test_max_uint16',
		'test_max_uint32',
		'test_max_uint64',
		'test_maxpool_1d_default',
		'test_maxpool_2d_ceil',
		'test_maxpool_2d_default',
		'test_maxpool_2d_pads',
		'test_maxpool_2d_precomputed_pads',
		'test_maxpool_2d_precomputed_same_upper',
		'test_maxpool_2d_strides',
		'test_maxpool_3d_default',
		'test_mean_example',
		'test_mean_one_input',
		'test_mean_two_inputs',
		'test_min_example',
		'test_min_float16',
		'test_min_float32',
		'test_min_float64',
		'test_min_int8',
		'test_min_int16',
		'test_min_int32',
		'test_min_int64',
		'test_min_one_input',
		'test_min_two_inputs',
		'test_min_uint8',
		'test_min_uint16',
		'test_min_uint32',
		'test_min_uint64',
		'test_mul',
		'test_mul_bcast',
		'test_mul_example',
		'test_mul_uint8',
		'test_neg',
		'test_neg_example',
		'test_not_2d',
		'test_not_3d',
		'test_not_4d',
		'test_or_bcast3v1d',
		'test_or_bcast3v2d',
		'test_or_bcast4v2d',
		'test_or_bcast4v3d',
		'test_or_bcast4v4d',
		'test_or2d',
		'test_or3d',
		'test_or4d',
		'test_relu',
		'test_selu',
		'test_selu_default',
		'test_selu_example',
		'test_sigmoid',
		'test_sigmoid_example',
		'test_sign',
		'test_sin',
		'test_sin_example',
		'test_sinh',
		'test_sinh_example',
		'test_softplus',
		'test_softplus_example',
		'test_softsign',
		'test_softsign_example',
		'test_sqrt',
		'test_sqrt_example',
		'test_sub',
		'test_sub_bcast',
		'test_sub_example',
		'test_sub_uint8',
		'test_sum_example',
		'test_sum_one_input',
		'test_sum_two_inputs',
		'test_tan',
		'test_tan_example',
		'test_tanh',
		'test_tanh_example',
		'test_transpose_all_permutations_0',
		'test_transpose_all_permutations_1',
		'test_transpose_all_permutations_2',
		'test_transpose_all_permutations_3',
		'test_transpose_all_permutations_4',
		'test_transpose_all_permutations_5',
		'test_xor_bcast3v1d',
		'test_xor_bcast3v2d',
		'test_xor_bcast4v2d',
		'test_xor_bcast4v3d',
		'test_xor_bcast4v4d',
		'test_xor2d',
		'test_xor3d',
		'test_xor4d',
	],
	'pytorch-converted': [
		'test_AvgPool2d',
		'test_AvgPool2d_stride',
		'test_AvgPool3d',
		'test_AvgPool3d_stride1_pad0_gpu_input',
		'test_ELU',
		'test_LeakyReLU',
		'test_LeakyReLU_with_negval',
		'test_ReLU',
		'test_SELU',
		'test_Sigmoid',
		'test_Softplus',
		'test_Softsign',
		'test_Tanh',
	],
	'pytorch-operator': [
		'test_operator_add_broadcast',
		'test_operator_add_size1_broadcast',
		'test_operator_add_size1_right_broadcast',
		'test_operator_add_size1_singleton_broadcast',
		'test_operator_addconstant',
		'test_operator_basic',
		'test_operator_concat2',
		'test_operator_exp',
		'test_operator_flatten',
		'test_operator_max',
		'test_operator_min',
		'test_operator_selu',
		'test_operator_sqrt',
		'test_operator_view',
	],
	simple: ['test_sign_model', 'test_single_relu_model'],
}

describe('onnx backend test', () => {
	describe.each(Object.keys(testTargets))('%s', key => {
		test.each(testTargets[key])('%s', async testname => {
			const pathToTestDir = `${onnxBackendTestPath}/data/${key}/${testname}`
			const buf = await fs.promises.readFile(`${pathToTestDir}/model.onnx`)
			const net = ComputationalGraph.fromObject(await ONNXImporter.load(buf))

			const inputs = {}
			for (const node of net.nodes) {
				if (node.layer instanceof InputLayer) {
					const inputBuf = await fs.promises.readFile(
						`${pathToTestDir}/test_data_set_0/input_${Object.keys(inputs).length}.pb`
					)
					inputs[node.name] = Tensor.fromArray(
						loadTensor(onnx.TensorProto.deserializeBinary(inputBuf).toObject())
					)
					if (inputs[node.name].dimension === 2) {
						inputs[node.name] = inputs[node.name].toMatrix()
					}
				}
			}

			net.bind({ input: inputs })
			net.calc()

			let outputCounter = 0
			for (const node of net.nodes) {
				if (!(node.layer instanceof OutputLayer)) {
					continue
				}
				const outputBuf = await fs.promises.readFile(
					`${pathToTestDir}/test_data_set_0/output_${outputCounter++}.pb`
				)
				const t = Tensor.fromArray(loadTensor(onnx.TensorProto.deserializeBinary(outputBuf).toObject()))
				const y = node.outputValue
				expect(y.sizes).toEqual(t.sizes)
				for (let i = 0; i < t.length; i++) {
					if (isNaN(y.value[i]) && isNaN(t.value[i])) {
						continue
					}
					expect(y.value[i])[typeof t.value[i] === 'number' ? 'toBeCloseTo' : 'toBe'](t.value[i])
				}
			}
		})
	})
})
