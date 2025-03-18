import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import bitwise_xor from '../../../../../../lib/model/nns/onnx/layer/bitwise_xor.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([2, 3, 4])('array input %p', length => {
		const input = Array.from({ length }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
		const model = ONNXExporter.createONNXModel()
		const types = Object.fromEntries(
			input.map((v, i) => [
				v,
				{ type: i === 0 ? onnx.TensorProto.DataType.FLOAT : onnx.TensorProto.DataType.INT32 },
			])
		)
		const info = bitwise_xor.export(model, { type: 'bitwise_xor', input }, types)
		expect(info).toEqual({ type: onnx.TensorProto.DataType.INT32 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(input.length)
		expect(nodes[0].getOpType()).toBe('Cast')
		for (let i = 1; i < input.length; i++) {
			expect(nodes[1].getOpType()).toBe('BitwiseXor')
		}
	})

	test('array input 1', () => {
		const model = ONNXExporter.createONNXModel()
		const info = bitwise_xor.export(model, { type: 'bitwise_xor', input: ['x'] })
		expect(info).toBeUndefined()
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Identity')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => bitwise_xor.export(model, { type: 'bitwise_xor', input: 'x' })).toThrow(
			"Invalid attribute 'input'"
		)
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		{ x1: { a: [100, 3], s: [null, 3] }, x2: { a: [100, 3], s: [null, 3] } },
		{ x1: { a: [100, 3], s: [null, 3] }, x2: { a: [100, 1], s: [null, 1] } },
		{ x1: { a: [100, 3], s: [null, 3] } },
		{ x1: { a: [100, 3], s: [null, 3] }, x2: { a: [100, 3], s: [null, 3] }, x3: { a: [100, 3], s: [null, 3] } },
	])('bitwise_xor %p', async ins => {
		const inputNames = Object.keys(ins)
		const buf = ONNXExporter.dump([
			...inputNames.map(i => ({ type: 'input', name: i, size: ins[i].s })),
			{ type: 'bitwise_xor', input: inputNames },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = []
		const xten = {}
		for (const i of inputNames) {
			const v = Matrix.randint(ins[i].a, 0, 255)
			x.push(v)
			xten[i] = new ort.Tensor('float32', v.value, v.sizes)
		}
		const out = await session.run(xten)
		const yten = out._bitwise_xor
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'bitwise_xor' }).calc(...x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(t.value[i])
		}
	})
})
