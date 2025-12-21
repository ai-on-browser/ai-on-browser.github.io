import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import TafLayer from '../../../../../../lib/model/nns/layer/taf.js'
import taf from '../../../../../../lib/model/nns/onnx/layer/taf.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 1, b: 2 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		taf.export(model, { type: 'taf', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(5)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Sub')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Add')
		expect(nodes[4].getOpType()).toBe('Sqrt')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.a ?? 0])
		expect(initializers[1].getFloatDataList()).toEqual([param.b ?? 0])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 1, b: 2 }])('taf %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'taf', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._taf
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new TafLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
