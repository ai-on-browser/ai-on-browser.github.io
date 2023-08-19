import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import bdaa from '../../../../../../lib/model/nns/onnx/layer/bdaa.js'
import BDAALayer from '../../../../../../lib/model/nns/layer/bdaa.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 2 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		bdaa.export(model, { type: 'bdaa', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(12)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Constant')
		expect(nodes[2].getOpType()).toBe('Neg')
		expect(nodes[3].getOpType()).toBe('Exp')
		expect(nodes[4].getOpType()).toBe('Add')
		expect(nodes[5].getOpType()).toBe('Reciprocal')
		expect(nodes[6].getOpType()).toBe('Sub')
		expect(nodes[7].getOpType()).toBe('Exp')
		expect(nodes[8].getOpType()).toBe('Add')
		expect(nodes[9].getOpType()).toBe('Reciprocal')
		expect(nodes[10].getOpType()).toBe('Sub')
		expect(nodes[11].getOpType()).toBe('Div')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.alpha ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 2.0 }])('bdaa %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'bdaa', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._bdaa
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new BDAALayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
