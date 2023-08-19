import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import ptanh from '../../../../../../lib/model/nns/onnx/layer/ptanh.js'
import PtanhLayer from '../../../../../../lib/model/nns/layer/ptanh.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 0.5 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		ptanh.export(model, { type: 'ptanh', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(6)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Constant')
		expect(nodes[2].getOpType()).toBe('Tanh')
		expect(nodes[3].getOpType()).toBe('Less')
		expect(nodes[4].getOpType()).toBe('Where')
		expect(nodes[5].getOpType()).toBe('Mul')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.a ?? 0.25])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 0.5 }])('ptanh %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'ptanh', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._ptanh
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PtanhLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
