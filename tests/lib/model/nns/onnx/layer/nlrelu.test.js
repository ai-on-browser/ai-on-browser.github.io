import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import nlrelu from '../../../../../../lib/model/nns/onnx/layer/nlrelu.js'
import NLReluLayer from '../../../../../../lib/model/nns/layer/nlrelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], beta: 2 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		nlrelu.export(model, { type: 'nlrelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(5)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Relu')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Add')
		expect(nodes[4].getOpType()).toBe('Log')
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

	test.each([{}, { beta: 2 }])('nlrelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'nlrelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._nlrelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new NLReluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
