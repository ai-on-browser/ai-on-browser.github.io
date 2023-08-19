import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import stanh from '../../../../../../lib/model/nns/onnx/layer/stanh.js'
import StanhLayer from '../../../../../../lib/model/nns/layer/stanh.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 2, b: 3 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		stanh.export(model, { type: 'stanh', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Tanh')
		expect(nodes[2].getOpType()).toBe('Mul')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.a ?? 1])
		expect(initializers[1].getFloatDataList()).toEqual([param.b ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 3, b: 4 }])('stanh %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'stanh', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._stanh
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new StanhLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
