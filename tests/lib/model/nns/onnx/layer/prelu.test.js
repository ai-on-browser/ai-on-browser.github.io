import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import prelu from '../../../../../../lib/model/nns/onnx/layer/prelu.js'
import PreluLayer from '../../../../../../lib/model/nns/layer/prelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 1 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		prelu.export(model, { type: 'prelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('PRelu')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.a ?? 0.25])
	})

	test('string params', () => {
		const model = ONNXExporter.createONNXModel()
		prelu.export(model, { type: 'prelu', input: ['x'], a: 'a' })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('PRelu')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(0)
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 2 }, {a: [1, 2, 3]}])('prelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'prelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._prelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PreluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})

	test('prelu with string params', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'const', value: 2, name: 'a' },
			{ type: 'input', size: [null, 3] },
			{ type: 'prelu', a: 'a' },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._prelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PreluLayer({ a: 2 }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
