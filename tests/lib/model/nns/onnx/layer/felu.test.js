import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import FEluLayer from '../../../../../../lib/model/nns/layer/felu.js'
import felu from '../../../../../../lib/model/nns/onnx/layer/felu.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 2 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		felu.export(model, { type: 'felu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('LeakyRelu')
		expect(nodes[1].getOpType()).toBe('Elu')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 2 }])('felu %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'felu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._felu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new FEluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
