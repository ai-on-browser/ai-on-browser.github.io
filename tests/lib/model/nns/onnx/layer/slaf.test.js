import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import slaf from '../../../../../../lib/model/nns/onnx/layer/slaf.js'
import SlafLayer from '../../../../../../lib/model/nns/layer/slaf.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		slaf.export(model, { type: 'slaf', input: 'x' })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(4)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Mul')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Sum')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(3)
		expect(initializers[0].getFloatDataList()).toEqual([1])
		expect(initializers[1].getFloatDataList()).toEqual([1])
		expect(initializers[2].getFloatDataList()).toEqual([1])
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		slaf.export(model, { type: 'slaf', input: ['x'], n: 4, a: [2, 3, 4, 5] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(6)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Mul')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('Mul')
		expect(nodes[5].getOpType()).toBe('Sum')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(4)
		expect(initializers[0].getFloatDataList()).toEqual([2])
		expect(initializers[1].getFloatDataList()).toEqual([3])
		expect(initializers[2].getFloatDataList()).toEqual([4])
		expect(initializers[3].getFloatDataList()).toEqual([5])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { n: 4, a: 2 }])('slaf %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'slaf', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._slaf
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new SlafLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
