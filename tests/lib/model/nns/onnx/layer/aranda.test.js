import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import aranda from '../../../../../../lib/model/nns/onnx/layer/aranda.js'
import ArandaLayer from '../../../../../../lib/model/nns/layer/aranda.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], l: 1.5 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		aranda.export(model, { type: 'aranda', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(8)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Exp')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Add')
		expect(nodes[4].getOpType()).toBe('Reciprocal')
		expect(nodes[5].getOpType()).toBe('Reciprocal')
		expect(nodes[6].getOpType()).toBe('Pow')
		expect(nodes[7].getOpType()).toBe('Sub')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.l ?? 2.0])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { l: 1.0 }, { l: 2.0 }])('aranda %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'aranda', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._aranda
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new ArandaLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
