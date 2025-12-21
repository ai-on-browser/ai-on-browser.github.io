import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import BatchNormalizationLayer from '../../../../../../lib/model/nns/layer/batch_normalization.js'
import batch_normalization from '../../../../../../lib/model/nns/onnx/layer/batch_normalization.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([{ input: 'x', channel_dim: -1 }, { input: ['x'] }])('last channel %j', param => {
		const model = ONNXExporter.createONNXModel()
		batch_normalization.export(model, { type: 'batch_normalization', ...param }, { x: { size: [null, 10, 3] } })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(8)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('ReduceMean')
		expect(nodes[3].getOpType()).toBe('ReduceMean')
		expect(nodes[4].getOpType()).toBe('Sub')
		expect(nodes[5].getOpType()).toBe('Mul')
		expect(nodes[6].getOpType()).toBe('ReduceMean')
		expect(nodes[7].getOpType()).toBe('BatchNormalization')
	})

	test('first channel', () => {
		const model = ONNXExporter.createONNXModel()
		batch_normalization.export(
			model,
			{ type: 'batch_normalization', input: 'x', channel_dim: 1 },
			{ x: { size: [null, 10, 3] } }
		)
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(6)
		expect(nodes[0].getOpType()).toBe('ReduceMean')
		expect(nodes[1].getOpType()).toBe('ReduceMean')
		expect(nodes[2].getOpType()).toBe('Sub')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('ReduceMean')
		expect(nodes[5].getOpType()).toBe('BatchNormalization')
	})

	test('array params', () => {
		const model = ONNXExporter.createONNXModel()
		batch_normalization.export(
			model,
			{ type: 'batch_normalization', input: 'x', input_mean: [1, 2, 3], input_var: [1, 2, 3] },
			{ x: { size: [null, 10, 3] } }
		)
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('BatchNormalization')
	})

	test('string params', () => {
		const model = ONNXExporter.createONNXModel()
		batch_normalization.export(
			model,
			{ type: 'batch_normalization', input: 'x', scale: 's', offset: 'o', input_mean: 'm', input_var: 'v' },
			{ x: { size: [null, 10, 3] } }
		)
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('BatchNormalization')
	})

	test('invalid channel dim', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			batch_normalization.export(
				model,
				{ type: 'batch_normalization', input: ['x'], channel_dim: 0 },
				{ x: { size: [null, 10, 3] } }
			)
		).toThrow("Not implemented value of attribute 'channel_dim' 0")
	})

	test('invalid scale', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			batch_normalization.export(
				model,
				{ type: 'batch_normalization', input: ['x'], scale: 1 },
				{ x: { size: [null, 10, null] } }
			)
		).toThrow('Size of channel dim must be specified if scale is scalar.')
	})

	test('invalid offset', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			batch_normalization.export(
				model,
				{ type: 'batch_normalization', input: ['x'], scale: [1, 2, 3], offset: 1 },
				{ x: { size: [null, 10, null] } }
			)
		).toThrow('Size of channel dim must be specified if offset is scalar.')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		[{ channel_dim: 1, input_mean: [1, 1, 1], input_var: [1, 1, 1] }, [null, 3, 3, 3], [1, 3, 3, 3]],
		[{}, [null, 3, 3, 3], [1, 3, 3, 3]],
		[{ channel_dim: 1 }, [null, 3, 3], [1, 3, 3]],
		[{ scale: [1, 2, 3], offset: [3, 2, 1] }, [null, 3, 3, 3], [1, 3, 3, 3]],
	])('batch normalization %j %j %j', { retry: 3, timeout: 10000 }, async (param, inSize, actualSize) => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: inSize },
			{ type: 'batch_normalization', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._batch_normalization
		expect(yten.dims).toEqual(actualSize)
		const y = await yten.getData(true)

		const t = new BatchNormalizationLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
