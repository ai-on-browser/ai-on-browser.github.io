import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import upsamplinlg from '../../../../../../lib/model/nns/onnx/layer/up_sampling.js'
import UpSamplingLayer from '../../../../../../lib/model/nns/layer/upsampling.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([
		[{ input: 'x', size: [2, 2] }, [1, 2, 2, 3], [1, 4, 4, 3], [1, 2, 2, 1]],
		[{ input: ['x'], size: 2 }, [1, 2, 2, 3], [1, 4, 4, 3], [1, 2, 2, 1]],
		[{ input: 'x', size: [2, 2], channel_dim: 1 }, [1, 3, 2, 2], [1, 3, 4, 4], [1, 1, 2, 2]],
	])('%j', (param, inSize, outSize, scale) => {
		const model = ONNXExporter.createONNXModel()
		const info = upsamplinlg.export(model, { type: 'up_samplinlg', ...param }, { x: { size: inSize } })
		expect(info.size).toEqual(outSize)
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Resize')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual(scale)
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('up_sampling', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 2, 2, 3] },
			{ type: 'up_sampling', size: [2, 2] },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn([100, 2, 2, 3])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._up_sampling
		expect(yten.dims).toEqual([100, 4, 4, 3])
		const y = await yten.getData(true)

		const t = new UpSamplingLayer({ size: [2, 2] }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
