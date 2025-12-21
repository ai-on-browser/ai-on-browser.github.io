import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import LRNLayer from '../../../../../../lib/model/nns/layer/lrn.js'
import lrn from '../../../../../../lib/model/nns/onnx/layer/lrn.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([
		{ input: 'x', channel_dim: -1, n: 3 },
		{ input: ['x'], n: 3 },
	])('last channel %j', param => {
		const model = ONNXExporter.createONNXModel()
		lrn.export(model, { type: 'lrn', ...param }, { x: { size: [null, 10, 3] } })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('LRN')
	})

	test('first channel', () => {
		const model = ONNXExporter.createONNXModel()
		lrn.export(model, { type: 'lrn', input: 'x', channel_dim: 1, n: 3 }, { x: { size: [null, 10, 3] } })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('LRN')
	})

	test('invalid channel dim', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			lrn.export(model, { type: 'lrn', input: ['x'], channel_dim: 0, n: 3 }, { x: { size: [null, 10, 3] } })
		).toThrow("Not implemented value of attribute 'channel_dim' 0")
	})

	test('require n', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			lrn.export(model, { type: 'lrn', input: ['x'], channel_dim: -1 }, { x: { size: [null, 10, 3] } })
		).toThrow("Require attribute 'n'")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		[{ channel_dim: 1, n: 3 }, [null, 4, 3, 3], [1, 4, 3, 3]],
		[{ n: 5 }, [null, 4, 4, 10], [1, 4, 4, 10]],
		[{ alpha: 0.0002, beta: 0.7, k: 2, n: 5 }, [null, 3, 3, 5], [1, 3, 3, 5]],
	])('lrn %j %j %j', { retry: 3 }, async (param, inSize, actualSize) => {
		const buf = ONNXExporter.dump([{ type: 'input', size: inSize }, { type: 'lrn', ...param }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._lrn
		expect(yten.dims).toEqual(actualSize)
		const y = await yten.getData(true)

		const t = new LRNLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
