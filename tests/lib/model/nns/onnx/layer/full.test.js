import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import full from '../../../../../../lib/model/nns/onnx/layer/full.js'
import FullLayer from '../../../../../../lib/model/nns/layer/full.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = full.export(
			model,
			{
				type: 'full',
				input: ['x'],
				name: 'a',
				out_size: 2,
				w: [[1, 2]],
				b: [0, 0],
			},
			{ x: { size: [null, 5] } }
		)
		expect(info).toEqual({ size: [null, 2] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Gemm')
	})

	test('no bias', () => {
		const model = ONNXExporter.createONNXModel()
		const info = full.export(
			model,
			{ type: 'full', input: ['x'], name: 'a', out_size: 2, w: [[1, 2]] },
			{ x: { size: [null, 5] } }
		)
		expect(info.size).toEqual([null, 2])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Gemm')
	})

	test('string params', () => {
		const model = ONNXExporter.createONNXModel()
		const info = full.export(
			model,
			{ type: 'full', input: 'x', name: 'a', out_size: 2, w: 'w', b: 'b' },
			{ x: { size: [null, 5] } }
		)
		expect(info.size).toEqual([null, 2])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Gemm')
	})

	test('string size', () => {
		const model = ONNXExporter.createONNXModel()
		const info = full.export(
			model,
			{ type: 'full', input: 'x', name: 'a', out_size: 's', w: 'w', b: 'b' },
			{ x: { size: [null, 5] }, s: { size: [3, 4] } }
		)
		expect(info.size).toEqual([null, 4])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Gemm')
	})

	test('with string activation', () => {
		const model = ONNXExporter.createONNXModel()
		const info = full.export(
			model,
			{
				type: 'full',
				input: 'x',
				name: 'a',
				out_size: 2,
				w: 'w',
				b: 'b',
				activation: 'tanh',
			},
			{ x: { size: [null, 5] } }
		)
		expect(info.size).toEqual([null, 2])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('Gemm')
		expect(nodes[1].getOpType()).toBe('Tanh')
	})

	test('with obj activation', () => {
		const model = ONNXExporter.createONNXModel()
		const info = full.export(
			model,
			{
				type: 'full',
				input: 'x',
				name: 'a',
				out_size: 2,
				w: 'w',
				b: 'b',
				activation: { type: 'tanh' },
			},
			{ x: { size: [null, 5] } }
		)
		expect(info.size).toEqual([null, 2])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('Gemm')
		expect(nodes[1].getOpType()).toBe('Tanh')
	})

	test('require w', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			full.export(model, { type: 'full', input: 'x', name: 'a', out_size: 2 }, { x: { size: [null, 5] } })
		).toThrow("Require attribute 'w'")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		{
			w: Matrix.fromArray([
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
				[4, 5, 6],
				[5, 6, 7],
			]),
			b: Matrix.fromArray([[1, 2, 3]]),
		},
		{
			out_size: 3,
			w: Matrix.fromArray([
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
				[4, 5, 6],
				[5, 6, 7],
			]),
		},
		{
			out_size: 3,
			w: Matrix.fromArray([
				[1, 2, 3],
				[2, 3, 4],
				[3, 4, 5],
				[4, 5, 6],
				[5, 6, 7],
			]),
			activation: 'tanh',
		},
	])('full %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 5] },
			{
				type: 'full',
				...param,
			},
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 5)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._full
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new FullLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
