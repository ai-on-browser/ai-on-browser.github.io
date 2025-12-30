import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import MpeluLayer from '../../../../../../lib/model/nns/layer/mpelu.js'
import mpelu from '../../../../../../lib/model/nns/onnx/layer/mpelu.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 2, beta: 2 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		mpelu.export(model, { type: 'mpelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('LeakyRelu')
		expect(nodes[1].getOpType()).toBe('Elu')
		expect(nodes[2].getOpType()).toBe('LeakyRelu')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 2, beta: 2 }])('mpelu %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'mpelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._mpelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new MpeluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
