import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import clip from '../../../../../../lib/model/nns/onnx/layer/clip.js'
import ClipLayer from '../../../../../../lib/model/nns/layer/clip.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		clip.export(model, { type: 'clip', input: 'x' })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Clip')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(0)
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		clip.export(model, { type: 'clip', input: ['x'], min: -1, max: 1 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Clip')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([-1])
		expect(initializers[1].getFloatDataList()).toEqual([1])
	})

	test('string params', () => {
		const model = ONNXExporter.createONNXModel()
		clip.export(model, { type: 'clip', input: ['x'], min: 'mn', max: 'mx' })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Clip')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(0)
	})

	test('only max', () => {
		const model = ONNXExporter.createONNXModel()
		clip.export(model, { type: 'clip', input: ['x'], max: 0 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Clip')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([0])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { min: -1, max: 1 }, { max: 0 }])('clip %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'clip', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._clip
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new ClipLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})

	test('clip with string params', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'const', value: 1, name: 'minv' },
			{ type: 'const', value: 2, name: 'maxv' },
			{ type: 'input', size: [null, 3] },
			{ type: 'clip', min: 'minv', max: 'maxv' },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._clip
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new ClipLayer({ min: 1, max: 2 }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
