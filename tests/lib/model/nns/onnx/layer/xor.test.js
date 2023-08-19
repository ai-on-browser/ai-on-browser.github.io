import * as ort from 'onnxruntime-web'

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import xor from '../../../../../../lib/model/nns/onnx/layer/xor.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([2, 3, 4])('array input %p', length => {
		const input = Array.from({ length }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
		const model = ONNXExporter.createONNXModel()
		const types = Object.fromEntries(
			input.map((v, i) => [
				v,
				{ type: i === 0 ? onnx.TensorProto.DataType.FLOAT : onnx.TensorProto.DataType.BOOL },
			])
		)
		const info = xor.export(model, { type: 'xor', input }, types)
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(input.length)
		expect(nodes[0].getOpType()).toBe('Cast')
		for (let i = 1; i < input.length; i++) {
			expect(nodes[1].getOpType()).toBe('Xor')
		}
	})

	test('array input 1', () => {
		const model = ONNXExporter.createONNXModel()
		const info = xor.export(model, { type: 'xor', input: ['x'] })
		expect(info).toBeUndefined()
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Identity')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => xor.export(model, { type: 'xor', input: 'x' })).toThrow("Invalid attribute 'input'")
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
	])('xor %p', async ins => {
		const inputNames = Object.keys(ins)
		const buf = ONNXExporter.dump([
			...inputNames.map(i => ({ type: 'input', name: i, size: ins[i].s })),
			{ type: 'xor', input: inputNames },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = []
		const xten = {}
		for (const i of inputNames) {
			const v = Matrix.randn(ins[i].a)
			v.map(v => +(v < 0))
			x.push(v)
			xten[i] = new ort.Tensor('float32', v.value, v.sizes)
		}
		const out = await session.run(xten)
		const yten = out._xor
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'xor' }).calc(...x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(+t.value[i])
		}
	})
})
