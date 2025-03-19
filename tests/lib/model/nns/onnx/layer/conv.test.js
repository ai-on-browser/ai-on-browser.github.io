import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import conv from '../../../../../../lib/model/nns/onnx/layer/conv.js'
import ConvLayer from '../../../../../../lib/model/nns/layer/conv.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([
		{ input: 'x', channel_dim: -1, w: Tensor.randn([5, 3, 2]) },
		{ input: ['x'], w: Tensor.randn([5, 3, 2]) },
	])('last channel %p', param => {
		const model = ONNXExporter.createONNXModel()
		const info = conv.export(model, { type: 'conv', ...param }, { x: { size: [null, 10, 3] } })
		expect(info.size).toEqual([null, null, 5])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('Conv')
	})

	test('first channel', () => {
		const model = ONNXExporter.createONNXModel()
		const info = conv.export(
			model,
			{ type: 'conv', input: 'x', channel_dim: 1, w: Tensor.randn([7, 10, 2]) },
			{ x: { size: [null, 10, 3] } }
		)
		expect(info.size).toEqual([null, 7, null])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Conv')
	})

	test('string param', () => {
		const model = ONNXExporter.createONNXModel()
		const info = conv.export(
			model,
			{ type: 'conv', input: 'x', channel_dim: 1, w: 'w' },
			{ x: { size: [null, 10, 3] }, w: { size: [6, 10, 2] } }
		)
		expect(info.size).toEqual([null, 6, null])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Conv')
	})

	test('invalid channel dim', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			conv.export(model, { type: 'conv', input: ['x'], channel_dim: 0 }, { x: { size: [null, 10, 3] } })
		).toThrow("Not implemented value of attribute 'channel_dim' 0")
	})

	test('require w', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => conv.export(model, { type: 'conv', input: ['x'] }, { x: { size: [null, 10, 3] } })).toThrow(
			"Require attribute 'w'"
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
		[
			{ kernel: [2, 2], channel_dim: 1, w: Tensor.randn([5, 3, 2, 2]) },
			[null, 3, 3, 3],
			[1, 3, 3, 3],
			[1, 5, 2, 2],
		],
		[{ kernel: [2, 2], w: Tensor.randn([5, 3, 2, 2]) }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 2, 2, 5]],
		[{ kernel: 2, channel_dim: 1, w: Tensor.randn([5, 3, 2, 2]) }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 5, 2, 2]],
		[{ kernel: 2, channel_dim: 1, w: Tensor.randn([5, 3, 2]) }, [null, 3, 3], [1, 3, 3], [1, 5, 2]],
		[
			{ kernel: 2, channel_dim: 1, stride: 2, w: Tensor.randn([5, 3, 2, 2]) },
			[null, 3, 4, 4],
			[1, 3, 4, 4],
			[1, 5, 2, 2],
		],
		[
			{ kernel: 2, channel_dim: 1, stride: 2, w: Tensor.randn([5, 3, 2, 2]) },
			[null, 3, 3, 3],
			[1, 3, 3, 3],
			[1, 5, 2, 2],
		],
		[
			{ kernel: 2, channel_dim: 1, stride: 2, w: Tensor.randn([5, 3, 2, 2]) },
			[null, 3, null, null],
			[1, 3, 4, 4],
			[1, 5, 2, 2],
		],
		[
			{ kernel: 2, channel_dim: 1, stride: [1, 2], w: Tensor.randn([5, 3, 2, 2]) },
			[null, 3, 4, 4],
			[1, 3, 4, 4],
			[1, 5, 3, 2],
		],
		[
			{ kernel: 2, channel_dim: 1, padding: 1, w: Tensor.randn([2, 3, 2, 2]) },
			[null, 3, 4, 4],
			[1, 3, 4, 4],
			[1, 2, 5, 5],
		],
		[{ kernel: 2, padding: [1, 0], w: Tensor.randn([2, 3, 2, 2]) }, [null, 4, 4, 3], [1, 4, 4, 3], [1, 5, 3, 2]],
		[
			{
				kernel: 2,
				channel_dim: 1,
				padding: [
					[0, 1],
					[1, 0],
				],
				w: Tensor.randn([2, 3, 2, 2]),
			},
			[null, 3, 4, 4],
			[1, 3, 4, 4],
			[1, 2, 4, 4],
		],
	])('conv %p %p %p %p', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([{ type: 'input', size: inSize }, { type: 'conv', ...param }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._conv
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new ConvLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
