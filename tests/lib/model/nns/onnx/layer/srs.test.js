import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import srs from '../../../../../../lib/model/nns/onnx/layer/srs.js'
import SrsLayer from '../../../../../../lib/model/nns/layer/srs.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 2, beta: 3 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		srs.export(model, { type: 'srs', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(6)
		expect(nodes[0].getOpType()).toBe('Neg')
		expect(nodes[1].getOpType()).toBe('Div')
		expect(nodes[2].getOpType()).toBe('Exp')
		expect(nodes[3].getOpType()).toBe('Div')
		expect(nodes[4].getOpType()).toBe('Add')
		expect(nodes[5].getOpType()).toBe('Div')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.alpha ?? 3])
		expect(initializers[1].getFloatDataList()).toEqual([param.beta ?? 2])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 3, beta: 4 }])('srs %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'srs', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._srs
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new SrsLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
