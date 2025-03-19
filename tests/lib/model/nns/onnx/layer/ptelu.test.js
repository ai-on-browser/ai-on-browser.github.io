import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import ptelu from '../../../../../../lib/model/nns/onnx/layer/ptelu.js'
import PteluLayer from '../../../../../../lib/model/nns/layer/ptelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 0.5, beta: 2 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		ptelu.export(model, { type: 'ptelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(6)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Mul')
		expect(nodes[2].getOpType()).toBe('Tanh')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('Greater')
		expect(nodes[5].getOpType()).toBe('Where')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.alpha ?? 1])
		expect(initializers[1].getFloatDataList()).toEqual([param.beta ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 0.5, beta: 2 }])('ptelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'ptelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._ptelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PteluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
