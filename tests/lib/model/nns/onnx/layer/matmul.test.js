import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import MatmulLayer from '../../../../../../lib/model/nns/layer/matmul.js'
import matmul from '../../../../../../lib/model/nns/onnx/layer/matmul.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = matmul.export(
			model,
			{ type: 'matmul', input: ['x', 'y'] },
			{ x: { size: [null, 5] }, y: { size: [5, 8] } }
		)
		expect(info).toEqual({ size: [null, 8] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('MatMul')
	})

	test('array input 1', () => {
		const model = ONNXExporter.createONNXModel()
		const info = matmul.export(model, { type: 'matmul', input: ['x'] }, { x: { size: [null, 5] } })
		expect(info).toEqual({ size: [null, 5] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Identity')
	})

	test('array input 3', () => {
		const model = ONNXExporter.createONNXModel()
		const info = matmul.export(
			model,
			{ type: 'matmul', input: ['x', 'y', 'z'] },
			{ x: { size: [null, 5] }, z: { size: [3, 8] } }
		)
		expect(info).toEqual({ size: [null, 8] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('MatMul')
		expect(nodes[1].getOpType()).toBe('MatMul')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => matmul.export(model, { type: 'matmul', input: 'x' })).toThrow("Invalid attribute 'input'")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		{ x1: { a: [100, 5], s: [null, 5] }, x2: { a: [5, 3], s: [5, 3] } },
		{ x1: { a: [100, 3], s: [null, 3] } },
		{ x1: { a: [100, 7], s: [null, 7] }, x2: { a: [7, 5], s: [7, 5] }, x3: { a: [5, 3], s: [5, 3] } },
	])('matmul %j', async ins => {
		const inputNames = Object.keys(ins)
		const buf = ONNXExporter.dump([
			...inputNames.map(i => ({ type: 'input', name: i, size: ins[i].s })),
			{ type: 'matmul', input: inputNames },
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
		const yten = out._matmul
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new MatmulLayer({}).calc(...x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
