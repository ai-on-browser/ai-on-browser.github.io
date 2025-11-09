import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import pdelu from '../../../../../../lib/model/nns/onnx/layer/pdelu.js'
import PdeluLayer from '../../../../../../lib/model/nns/layer/pdelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], t: 0.2, alpha: 2 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		pdelu.export(model, { type: 'pdelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(11)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Constant')
		expect(nodes[2].getOpType()).toBe('Sub')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('Add')
		expect(nodes[5].getOpType()).toBe('Reciprocal')
		expect(nodes[6].getOpType()).toBe('Pow')
		expect(nodes[7].getOpType()).toBe('Sub')
		expect(nodes[8].getOpType()).toBe('Mul')
		expect(nodes[9].getOpType()).toBe('Greater')
		expect(nodes[10].getOpType()).toBe('Where')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.alpha ?? 1])
		expect(initializers[1].getFloatDataList()).toEqual([param.t ?? 0.1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { t: 2, alpha: 0.2 }])('pdelu %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'pdelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.random(100, 3, -1, 5)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._pdelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PdeluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
