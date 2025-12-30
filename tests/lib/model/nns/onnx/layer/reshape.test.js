import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import ReshapeLayer from '../../../../../../lib/model/nns/layer/reshape.js'
import reshape from '../../../../../../lib/model/nns/onnx/layer/reshape.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = reshape.export(
			model,
			{ type: 'reshape', input: 'x', size: [null, 6] },
			{ x: { size: [null, 2, 3] } }
		)
		expect(info).toEqual({ size: [null, 6] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Reshape')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getInt64DataList()).toEqual([-1, 6])
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = reshape.export(
			model,
			{ type: 'reshape', input: ['x'], size: 'y' },
			{ x: { size: [null, 2, 3] }, y: { size: [null, 6] } }
		)
		expect(info).toEqual({ size: [null, 6] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Reshape')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getInt64DataList()).toEqual([-1, 6])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('reshape', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'reshape', size: [50, 6] },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._reshape
		expect(yten.dims).toEqual([50, 6])
		const y = await yten.getData(true)

		const t = new ReshapeLayer({ size: [50, 6] }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})

	test('reshape no first dim', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3, 2] },
			{ type: 'reshape', size: [6] },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn([100, 3, 2])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._reshape
		expect(yten.dims).toEqual([100, 6])
		const y = await yten.getData(true)

		const t = new ReshapeLayer({ size: [6] }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
