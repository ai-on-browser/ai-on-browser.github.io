import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import eswish from '../../../../../../lib/model/nns/onnx/layer/eswish.js'
import EswishLayer from '../../../../../../lib/model/nns/layer/eswish.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], beta: 2 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		eswish.export(model, { type: 'eswish', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Sigmoid')
		expect(nodes[1].getOpType()).toBe('Mul')
		expect(nodes[2].getOpType()).toBe('Mul')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.beta ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { beta: 2 }])('eswish %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'eswish', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._eswish
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new EswishLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
