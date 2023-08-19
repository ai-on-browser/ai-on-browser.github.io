import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import hexpo from '../../../../../../lib/model/nns/onnx/layer/hexpo.js'
import HexpoLayer from '../../../../../../lib/model/nns/layer/hexpo.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 2, b: 3, c: 4, d: 5 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		hexpo.export(model, { type: 'hexpo', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(9)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Neg')
		expect(nodes[2].getOpType()).toBe('Neg')
		expect(nodes[3].getOpType()).toBe('GreaterOrEqual')
		expect(nodes[4].getOpType()).toBe('Where')
		expect(nodes[5].getOpType()).toBe('Div')
		expect(nodes[6].getOpType()).toBe('Elu')
		expect(nodes[7].getOpType()).toBe('Where')
		expect(nodes[8].getOpType()).toBe('Mul')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(4)
		expect(initializers[0].getFloatDataList()).toEqual([param.a ?? 1])
		expect(initializers[1].getFloatDataList()).toEqual([param.b ?? 1])
		expect(initializers[2].getFloatDataList()).toEqual([param.c ?? 1])
		expect(initializers[3].getFloatDataList()).toEqual([param.d ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 2, b: 2, c: 2, d: 2 }])('hexpo %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'hexpo', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._hexpo
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new HexpoLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
