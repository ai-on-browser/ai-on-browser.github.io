import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import ThresholdedReluLayer from '../../../../../../lib/model/nns/layer/thresholded_relu.js'
import thresholded_relu from '../../../../../../lib/model/nns/onnx/layer/thresholded_relu.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 1 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		thresholded_relu.export(model, { type: 'thresholded_relu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ThresholdedRelu')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 1 }])('thresholded_relu %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'thresholded_relu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._thresholded_relu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new ThresholdedReluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
