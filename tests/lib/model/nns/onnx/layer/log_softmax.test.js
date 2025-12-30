import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import LogSoftmaxLayer from '../../../../../../lib/model/nns/layer/logsoftmax.js'
import log_softmax from '../../../../../../lib/model/nns/onnx/layer/log_softmax.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], axis: 0 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		log_softmax.export(model, { type: 'log_softmax', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('LogSoftmax')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { axis: 0 }])('log_softmax %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'log_softmax', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._log_softmax
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new LogSoftmaxLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
