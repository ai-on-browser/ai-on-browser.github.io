import * as ort from 'onnxruntime-web'

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import bitwise_not from '../../../../../../lib/model/nns/onnx/layer/bitwise_not.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = bitwise_not.export(
			model,
			{ type: 'bitwise_not', input: 'x' },
			{ x: { type: onnx.TensorProto.DataType.INT16 } }
		)
		expect(info).toEqual({ type: onnx.TensorProto.DataType.INT16 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('BitwiseNot')
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = bitwise_not.export(
			model,
			{ type: 'bitwise_not', input: ['x'] },
			{ x: { type: onnx.TensorProto.DataType.FLOAT } }
		)
		expect(info).toEqual({ type: onnx.TensorProto.DataType.INT32 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[1].getOpType()).toBe('BitwiseNot')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('bitwise_not', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', name: 'x', size: [null, 10] },
			{ type: 'bitwise_not', input: 'x' },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randint(100, 10, 0, 255)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ x: xten })
		const yten = out._bitwise_not
		expect(yten.dims).toEqual([100, 10])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'bitwise_not' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(t.value[i])
		}
	})
})
