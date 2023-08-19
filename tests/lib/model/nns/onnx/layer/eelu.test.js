import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import eelu from '../../../../../../lib/model/nns/onnx/layer/eelu.js'
import EeluLayer from '../../../../../../lib/model/nns/layer/eelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 2, beta: 3, k: 4 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		eelu.export(model, { type: 'eelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(7)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Relu')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Min')
		expect(nodes[4].getOpType()).toBe('Mul')
		expect(nodes[5].getOpType()).toBe('Elu')
		expect(nodes[6].getOpType()).toBe('Add')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.k ?? 1])
		expect(initializers[1].getFloatDataList()).toEqual([param.beta ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 2, beta: 2, k: 2 }])('eelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'eelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._eelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new EeluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
