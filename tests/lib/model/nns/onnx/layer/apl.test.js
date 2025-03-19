import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import apl from '../../../../../../lib/model/nns/onnx/layer/apl.js'
import APLLayer from '../../../../../../lib/model/nns/layer/apl.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 1, b: 0.5 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		apl.export(model, { type: 'apl', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(8)
		expect(nodes[0].getOpType()).toBe('Relu')
		expect(nodes[1].getOpType()).toBe('Sub')
		expect(nodes[2].getOpType()).toBe('Relu')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('Sub')
		expect(nodes[5].getOpType()).toBe('Relu')
		expect(nodes[6].getOpType()).toBe('Mul')
		expect(nodes[7].getOpType()).toBe('Sum')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(4)
		expect(initializers[0].getFloatDataList()).toEqual([param.a ?? 0.1])
		expect(initializers[1].getFloatDataList()).toEqual([param.b ?? 0])
		expect(initializers[2].getFloatDataList()).toEqual([param.a ?? 0.1])
		expect(initializers[3].getFloatDataList()).toEqual([param.b ?? 0])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		{ a: 2.0, b: 1.0 },
		{ s: 3, a: [1, 2, 3], b: [-1, 0, 1] },
	])('apl %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'apl', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._apl
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new APLLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
