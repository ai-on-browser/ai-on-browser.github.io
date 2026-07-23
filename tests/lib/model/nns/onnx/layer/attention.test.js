import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import AttentionLayer from '../../../../../../lib/model/nns/layer/attention.js'
import attention from '../../../../../../lib/model/nns/onnx/layer/attention.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	describe('opset version 19', () => {
		test.each([
			{ input: ['x'], wq: Matrix.randn(3, 3), wk: Matrix.randn(3, 3), wv: Matrix.randn(3, 3) },
		])('input %j', param => {
			const model = ONNXExporter.createONNXModel({ opset: { version: 19 } })
			const info = attention.export(model, { type: 'attention', ...param }, { x: { size: [null, 3, 10] } })
			expect(info).toEqual({ size: [null, 3, 10] })
			const nodes = model.getGraph().getNodeList()
			expect(nodes).toHaveLength(14)
			expect(nodes[0].getOpType()).toBe('MatMul')
			expect(nodes[1].getOpType()).toBe('MatMul')
			expect(nodes[2].getOpType()).toBe('MatMul')
			expect(nodes[3].getOpType()).toBe('Einsum')
			expect(nodes[4].getOpType()).toBe('Shape')
			expect(nodes[5].getOpType()).toBe('Constant')
			expect(nodes[6].getOpType()).toBe('Constant')
			expect(nodes[7].getOpType()).toBe('SplitToSequence')
			expect(nodes[8].getOpType()).toBe('SequenceAt')
			expect(nodes[9].getOpType()).toBe('Cast')
			expect(nodes[10].getOpType()).toBe('Sqrt')
			expect(nodes[11].getOpType()).toBe('Div')
			expect(nodes[12].getOpType()).toBe('Softmax')
			expect(nodes[13].getOpType()).toBe('Einsum')
		})
	})

	describe('opset version 23', () => {
		test.each([
			{ input: ['x'], wq: Matrix.randn(3, 3), wk: Matrix.randn(3, 3), wv: Matrix.randn(3, 3) },
		])('input %j', param => {
			const model = ONNXExporter.createONNXModel({ opset: { version: 23 } })
			const info = attention.export(model, { type: 'attention', ...param }, { x: { size: [null, 3, 10] } })
			expect(info).toEqual({ size: [null, 3, 10] })
			const nodes = model.getGraph().getNodeList()
			expect(nodes).toHaveLength(4)
			expect(nodes[0].getOpType()).toBe('MatMul')
			expect(nodes[1].getOpType()).toBe('MatMul')
			expect(nodes[2].getOpType()).toBe('MatMul')
			expect(nodes[3].getOpType()).toBe('Attention')
		})
	})

	test('require wq', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => attention.export(model, { type: 'attention', input: 'x' })).toThrow("Require attribute 'wq'")
	})

	test('require wk', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => attention.export(model, { type: 'attention', input: 'x', wq: 'wq' })).toThrow(
			"Require attribute 'wk'"
		)
	})

	test('require wv', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => attention.export(model, { type: 'attention', input: 'x', wq: 'wq', wk: 'wk' })).toThrow(
			"Require attribute 'wv'"
		)
	})
})

describe.each([19, 23])('runtime opset version: %i', opsetVersion => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		{ wq: Matrix.randn(3, 3), wk: Matrix.randn(3, 3), wv: Matrix.randn(3, 3) },
	])('attention %j', async param => {
		const buf = ONNXExporter.dump(
			[{ type: 'input', size: [null, 3, 3] }, { type: 'attention', ...param }, { type: 'output' }],
			{ opset: { version: opsetVersion } }
		)
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn([100, 3, 3])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._attention
		expect(yten.dims).toEqual([100, 3, 3])
		const y = await yten.getData(true)

		const t = new AttentionLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})

	test('attention string params', async () => {
		const wk = Matrix.randn(3, 3)
		const wq = Matrix.randn(3, 3)
		const wv = Matrix.randn(3, 3)
		const buf = ONNXExporter.dump(
			[
				{ type: 'const', value: wk, name: 'wk' },
				{ type: 'const', value: wq, name: 'wq' },
				{ type: 'const', value: wv, name: 'wv' },
				{ type: 'input', size: [null, 3, 3] },
				{ type: 'attention', wk: 'wk', wq: 'wq', wv: 'wv' },
				{ type: 'output' },
			],
			{ opset: { version: opsetVersion } }
		)
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn([100, 3, 3])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._attention
		expect(yten.dims).toEqual([100, 3, 3])
		const y = await yten.getData(true)

		const t = new AttentionLayer({ wk, wq, wv }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
