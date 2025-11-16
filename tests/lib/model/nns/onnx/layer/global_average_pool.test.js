import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import globalAveragePool from '../../../../../../lib/model/nns/onnx/layer/global_average_pool.js'
import GlobalAveragePoolLayer from '../../../../../../lib/model/nns/layer/global_averagepool.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([{ input: 'x', channel_dim: -1 }, { input: ['x'] }])('last channel %j', param => {
		const model = ONNXExporter.createONNXModel()
		const info = globalAveragePool.export(
			model,
			{ type: 'global_average_pool', ...param },
			{ x: { size: [null, 10, 3] } }
		)
		expect(info.size).toEqual([null, 1, 3])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('GlobalAveragePool')
	})

	test('first channel', () => {
		const model = ONNXExporter.createONNXModel()
		const info = globalAveragePool.export(
			model,
			{ type: 'global_average_pool', input: 'x', channel_dim: 1 },
			{ x: { size: [null, 10, 3] } }
		)
		expect(info.size).toEqual([null, 10, 1])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('GlobalAveragePool')
	})

	test('invalid channel dim', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			globalAveragePool.export(
				model,
				{ type: 'global_average_pool', input: ['x'], channel_dim: 0 },
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
		[{}, [null, 3, 3, 3], [1, 3, 3, 3], [1, 1, 1, 3]],
		[{ channel_dim: 1 }, [null, 3, 3], [1, 3, 3], [1, 3, 1]],
	])('global average pool %j %j %j %j', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: inSize },
			{ type: 'global_average_pool', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._global_average_pool
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new GlobalAveragePoolLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
