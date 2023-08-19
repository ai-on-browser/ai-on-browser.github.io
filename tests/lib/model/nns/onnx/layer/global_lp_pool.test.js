import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import globalLpPool from '../../../../../../lib/model/nns/onnx/layer/global_lp_pool.js'
import GlobalLpPoolLayer from '../../../../../../lib/model/nns/layer/global_lppool.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([
		{ input: 'x', channel_dim: -1 },
		{ input: ['x'], p: 3 },
	])('last channel %p', param => {
		const model = ONNXExporter.createONNXModel()
		const info = globalLpPool.export(model, { type: 'global_lp_pool', ...param }, { x: { size: [null, 10, 3] } })
		expect(info.size).toEqual([null, 1, 3])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('GlobalLpPool')
	})

	test('first channel', () => {
		const model = ONNXExporter.createONNXModel()
		const info = globalLpPool.export(
			model,
			{ type: 'global_lp_pool', input: 'x', channel_dim: 1 },
			{ x: { size: [null, 10, 3] } }
		)
		expect(info.size).toEqual([null, 10, 1])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('GlobalLpPool')
	})

	test('invalid channel dim', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			globalLpPool.export(
				model,
				{ type: 'global_lp_pool', input: ['x'], channel_dim: 0 },
				{ x: { size: [null, 10, 3] } }
			)
		).toThrow("Not implemented value of attribute 'channel_dim' 0")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		[{ channel_dim: 1 }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 3, 1, 1]],
		[{ p: 3 }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 1, 1, 3]],
		[{ channel_dim: 1, p: 4 }, [null, 3, 3], [1, 3, 3], [1, 3, 1]],
	])('global lp pool %p %p %p %p', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: inSize },
			{ type: 'global_lp_pool', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		if ((param.p ?? 0) % 2 === 1) {
			x.map(Math.abs)
		}
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._global_lp_pool
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new GlobalLpPoolLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
