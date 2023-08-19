import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import concat from '../../../../../../lib/model/nns/onnx/layer/concat.js'
import ConcatLayer from '../../../../../../lib/model/nns/layer/concat.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = concat.export(
			model,
			{ type: 'concat', input: ['x', 'y'] },
			{ x: { size: [null, 3] }, y: { size: [null, 5] } }
		)
		expect(info).toEqual({ size: [null, 8] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Concat')
	})

	test('array input null 1', () => {
		const model = ONNXExporter.createONNXModel()
		const info = concat.export(
			model,
			{ type: 'concat', input: ['x', 'y'] },
			{ x: { size: [null, null] }, y: { size: [null, 5] } }
		)
		expect(info).toEqual({ size: [null, null] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Concat')
	})

	test('array input null 2', () => {
		const model = ONNXExporter.createONNXModel()
		const info = concat.export(
			model,
			{ type: 'concat', input: ['x', 'y'] },
			{ x: { size: [null, 3] }, y: { size: [null, null] } }
		)
		expect(info).toEqual({ size: [null, null] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Concat')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => concat.export(model, { type: 'concat', input: 'x' })).toThrow("Invalid attribute 'input'")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('concat', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', name: 'x1', size: [null, 3] },
			{ type: 'input', name: 'x2', size: [null, 3] },
			{ type: 'concat', input: ['x1', 'x2'] },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x1 = Matrix.randn(100, 3)
		const x1ten = new ort.Tensor('float32', x1.value, x1.sizes)
		const x2 = Matrix.randn(100, 3)
		const x2ten = new ort.Tensor('float32', x2.value, x2.sizes)
		const out = await session.run({ x1: x1ten, x2: x2ten })
		const yten = out._concat
		expect(yten.dims).toEqual([100, 6])
		const y = await yten.getData(true)

		const t = new ConcatLayer({}).calc(x1, x2)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})

	test('concat with axis', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', name: 'x1', size: [null, 3] },
			{ type: 'input', name: 'x2', size: [null, 3] },
			{ type: 'concat', input: ['x1', 'x2'], axis: 0 },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x1 = Matrix.randn(100, 3)
		const x1ten = new ort.Tensor('float32', x1.value, x1.sizes)
		const x2 = Matrix.randn(100, 3)
		const x2ten = new ort.Tensor('float32', x2.value, x2.sizes)
		const out = await session.run({ x1: x1ten, x2: x2ten })
		const yten = out._concat
		expect(yten.dims).toEqual([200, 3])
		const y = await yten.getData(true)

		const t = new ConcatLayer({ axis: 0 }).calc(x1, x2)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
