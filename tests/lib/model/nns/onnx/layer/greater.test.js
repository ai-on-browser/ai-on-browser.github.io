import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import greater from '../../../../../../lib/model/nns/onnx/layer/greater.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('array input 1', () => {
		const model = ONNXExporter.createONNXModel()
		const info = greater.export(model, { type: 'greater', input: ['x'] })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('Shape')
		expect(nodes[1].getOpType()).toBe('ConstantOfShape')
	})

	test('array input 2', () => {
		const model = ONNXExporter.createONNXModel()
		const info = greater.export(model, { type: 'greater', input: ['x', 'y'] })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Greater')
	})

	test('array input 3', () => {
		const model = ONNXExporter.createONNXModel()
		const info = greater.export(model, { type: 'greater', input: ['x', 'y', 'z'] })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Greater')
		expect(nodes[1].getOpType()).toBe('Greater')
		expect(nodes[2].getOpType()).toBe('And')
	})

	test('array input 4', () => {
		const model = ONNXExporter.createONNXModel()
		const info = greater.export(model, { type: 'greater', input: ['x', 'y', 'z', 'a'] })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(5)
		expect(nodes[0].getOpType()).toBe('Greater')
		expect(nodes[1].getOpType()).toBe('Greater')
		expect(nodes[2].getOpType()).toBe('Greater')
		expect(nodes[3].getOpType()).toBe('And')
		expect(nodes[4].getOpType()).toBe('And')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => greater.export(model, { type: 'greater', input: 'x' })).toThrow("Invalid attribute 'input'")
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
		{
			x1: { a: [100, 3], s: [null, 3] },
			x2: { a: [100, 3], s: [null, 3] },
			x3: { a: [100, 3], s: [null, 3] },
			x4: { a: [100, 3], s: [null, 3] },
		},
	])('greater %j', async ins => {
		const inputNames = Object.keys(ins)
		const buf = ONNXExporter.dump([
			...inputNames.map(i => ({ type: 'input', name: i, size: ins[i].s })),
			{ type: 'greater', input: inputNames },
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
		const yten = out._greater
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'greater' }).calc(...x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(+t.value[i])
		}
	})
})
