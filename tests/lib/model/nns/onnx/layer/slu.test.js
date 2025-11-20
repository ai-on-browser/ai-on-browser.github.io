import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import slu from '../../../../../../lib/model/nns/onnx/layer/slu.js'
import SluLayer from '../../../../../../lib/model/nns/layer/slu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 3, beta: 4, gamma: 5 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		slu.export(model, { type: 'slu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(7)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Softplus')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Sub')
		expect(nodes[4].getOpType()).toBe('Mul')
		expect(nodes[5].getOpType()).toBe('Greater')
		expect(nodes[6].getOpType()).toBe('Where')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(3)
		expect(initializers[0].getFloatDataList()).toEqual([param.alpha ?? 1])
		expect(initializers[1].getFloatDataList()).toEqual([param.beta ?? 1])
		expect(initializers[2].getFloatDataList()).toEqual([param.gamma ?? 0])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 3, beta: 4, gamma: 5 }])('slu %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'slu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._slu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new SluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
