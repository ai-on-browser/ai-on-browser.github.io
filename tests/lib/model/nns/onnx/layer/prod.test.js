import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import prod from '../../../../../../lib/model/nns/onnx/layer/prod.js'
import ProdLayer from '../../../../../../lib/model/nns/layer/prod.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		const info = prod.export(model, { type: 'prod', input: 'x' }, { x: { size: [null, 5] } })
		expect(info).toEqual({ size: [1, 1] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ReduceProd')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(0)
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = prod.export(model, { type: 'prod', input: ['x'], axis: 0 }, { x: { size: [null, 5] } })
		expect(info).toEqual({ size: [1, 5] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ReduceProd')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getInt64DataList()).toEqual([0])
	})

	test('array param', () => {
		const model = ONNXExporter.createONNXModel()
		const info = prod.export(model, { type: 'prod', input: 'x', axis: [0] }, { x: { size: [null, 5] } })
		expect(info).toEqual({ size: [1, 5] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ReduceProd')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getInt64DataList()).toEqual([0])
	})

	test('keepdims false', () => {
		const model = ONNXExporter.createONNXModel()
		const info = prod.export(model, { type: 'prod', input: 'x', keepdims: false }, { x: { size: [null, 5] } })
		expect(info).toEqual({ size: [] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ReduceProd')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(0)
	})

	test('keepdims false with axis', () => {
		const model = ONNXExporter.createONNXModel()
		const info = prod.export(model, { type: 'prod', input: 'x', keepdims: false, axis: 1 }, { x: { size: [2, 5] } })
		expect(info).toEqual({ size: [2] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ReduceProd')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getInt64DataList()).toEqual([1])
	})

	test('multi axis', () => {
		const model = ONNXExporter.createONNXModel()
		const info = prod.export(model, { type: 'prod', input: 'x', axis: [0, 1] }, { x: { size: [null, 5] } })
		expect(info).toEqual({ size: [1, 1] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ReduceProd')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getInt64DataList()).toEqual([1, 0])
	})

	test('string axis', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => prod.export(model, { type: 'prod', input: 'x', axis: 'a' }, { x: { size: [null, 5] } })).toThrow(
			'Unsupported axis type string'
		)
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		[{}, [null, 3], [100, 3], [1, 1]],
		[{ axis: 0 }, [null, 3], [100, 3], [1, 3]],
		[{ keepdims: false }, [null, 3], [100, 3], []],
	])('prod %p %p %p %p', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([{ type: 'input', size: inSize }, { type: 'prod', ...param }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._prod
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new ProdLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
