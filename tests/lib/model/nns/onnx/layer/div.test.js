import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import Layer from '../../../../../../lib/model/nns/layer/base.js'
import div from '../../../../../../lib/model/nns/onnx/layer/div.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([2, 3, 4])('array input %j', length => {
		const input = Array.from({ length }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
		const model = ONNXExporter.createONNXModel()
		div.export(model, { type: 'div', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(input.length - 1)
		for (let i = 0; i < input.length - 2; i++) {
			expect(nodes[i].getOpType()).toBe('Mul')
		}
		expect(nodes[input.length - 2].getOpType()).toBe('Div')
	})

	test('array input 1', () => {
		const model = ONNXExporter.createONNXModel()
		div.export(model, { type: 'div', input: ['x'] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Identity')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => div.export(model, { type: 'div', input: 'x' })).toThrow("Invalid attribute 'input'")
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
	])('div %j', async ins => {
		const inputNames = Object.keys(ins)
		const buf = ONNXExporter.dump([
			...inputNames.map(i => ({ type: 'input', name: i, size: ins[i].s })),
			{ type: 'div', input: inputNames },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = []
		const xten = {}
		for (const i of inputNames) {
			const v = Matrix.randn(ins[i].a)
			x.push(v)
			xten[i] = new ort.Tensor('float32', v.value, v.sizes)
		}
		const out = await session.run(xten)
		const yten = out._div
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'div' }).calc(...x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
