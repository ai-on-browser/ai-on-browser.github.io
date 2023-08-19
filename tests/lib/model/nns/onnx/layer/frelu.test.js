import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import frelu from '../../../../../../lib/model/nns/onnx/layer/frelu.js'
import FreluLayer from '../../../../../../lib/model/nns/layer/frelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], b: 1 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		frelu.export(model, { type: 'frelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('Relu')
		expect(nodes[1].getOpType()).toBe('Add')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.b ?? 0])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { b: 1 }])('frelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'frelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._frelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new FreluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
