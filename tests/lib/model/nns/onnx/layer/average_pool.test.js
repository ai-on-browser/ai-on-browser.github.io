import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import averagePool from '../../../../../../lib/model/nns/onnx/layer/average_pool.js'
import AveragePoolLayer from '../../../../../../lib/model/nns/layer/averagepool.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([{ input: 'x', channel_dim: -1 }, { input: ['x'] }])('last channel %p', param => {
		const model = ONNXExporter.createONNXModel()
		const info = averagePool.export(model, { type: 'average_pool', ...param }, { x: { size: [null, 10, 3] } })
		expect(info.size).toEqual([null, null, 3])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Transpose')
		expect(nodes[1].getOpType()).toBe('Transpose')
		expect(nodes[2].getOpType()).toBe('AveragePool')
	})

	test('first channel', () => {
		const model = ONNXExporter.createONNXModel()
		const info = averagePool.export(
			model,
			{ type: 'average_pool', input: 'x', channel_dim: 1 },
			{ x: { size: [null, 10, 3] } }
		)
		expect(info.size).toEqual([null, 10, null])
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('AveragePool')
	})

	test('invalid channel dim', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() =>
			averagePool.export(
				model,
				{ type: 'average_pool', input: ['x'], channel_dim: 0 },
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
		[{ kernel: [2, 2], channel_dim: 1 }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 3, 2, 2]],
		[{ kernel: [2, 2] }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 2, 2, 3]],
		[{ kernel: 2, channel_dim: 1 }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 3, 2, 2]],
		[{ kernel: 2, channel_dim: 1 }, [null, 3, 3], [1, 3, 3], [1, 3, 2]],
		[{ kernel: 2, channel_dim: 1 }, [null, 3, 4, 4], [1, 3, 4, 4], [1, 3, 2, 2]],
		[{ kernel: 2, channel_dim: 1, stride: 1 }, [null, 3, 4, 4], [1, 3, 4, 4], [1, 3, 3, 3]],
		[{ kernel: 2, channel_dim: 1, stride: 2 }, [null, 3, 3, 3], [1, 3, 3, 3], [1, 3, 2, 2]],
		[{ kernel: 2, channel_dim: 1, stride: 2 }, [null, 3, null, null], [1, 3, 4, 4], [1, 3, 2, 2]],
		[{ kernel: 2, channel_dim: 1, stride: [1, 2] }, [null, 3, 4, 4], [1, 3, 4, 4], [1, 3, 3, 2]],
		[{ kernel: 2, channel_dim: 1, padding: 1 }, [null, 3, 4, 4], [1, 3, 4, 4], [1, 3, 3, 3]],
		[{ kernel: 2, padding: [1, 0] }, [null, 4, 4, 3], [1, 4, 4, 3], [1, 3, 2, 3]],
		[
			{
				kernel: 2,
				channel_dim: 1,
				padding: [
					[0, 0],
					[1, 1],
				],
			},
			[null, 3, 4, 4],
			[1, 3, 4, 4],
			[1, 3, 2, 3],
		],
	])('average pool %p %p %p %p', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: inSize },
			{ type: 'average_pool', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._average_pool
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new AveragePoolLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
