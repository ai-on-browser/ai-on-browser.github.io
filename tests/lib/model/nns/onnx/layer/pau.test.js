import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import pau from '../../../../../../lib/model/nns/onnx/layer/pau.js'
import PauLayer from '../../../../../../lib/model/nns/layer/pau.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		pau.export(model, { type: 'pau', input: 'x' })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(11)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Sum')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('Sum')
		expect(nodes[5].getOpType()).toBe('Mul')
		expect(nodes[6].getOpType()).toBe('Mul')
		expect(nodes[7].getOpType()).toBe('Abs')
		expect(nodes[8].getOpType()).toBe('Constant')
		expect(nodes[9].getOpType()).toBe('Add')
		expect(nodes[10].getOpType()).toBe('Div')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(5)
		expect(initializers[0].getFloatDataList()).toEqual([0.1])
		expect(initializers[1].getFloatDataList()).toEqual([0.1])
		expect(initializers[2].getFloatDataList()).toEqual([0.1])
		expect(initializers[3].getFloatDataList()).toEqual([0])
		expect(initializers[4].getFloatDataList()).toEqual([0])
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		pau.export(model, { type: 'pau', input: ['x'], m: 3, n: 3, a: [2, 3, 4, 5], b: [1, 2, 3] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(14)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Mul')
		expect(nodes[2].getOpType()).toBe('Sum')
		expect(nodes[3].getOpType()).toBe('Mul')
		expect(nodes[4].getOpType()).toBe('Mul')
		expect(nodes[5].getOpType()).toBe('Mul')
		expect(nodes[6].getOpType()).toBe('Sum')
		expect(nodes[7].getOpType()).toBe('Mul')
		expect(nodes[8].getOpType()).toBe('Mul')
		expect(nodes[9].getOpType()).toBe('Mul')
		expect(nodes[10].getOpType()).toBe('Abs')
		expect(nodes[11].getOpType()).toBe('Constant')
		expect(nodes[12].getOpType()).toBe('Add')
		expect(nodes[13].getOpType()).toBe('Div')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(7)
		expect(initializers[0].getFloatDataList()).toEqual([2])
		expect(initializers[1].getFloatDataList()).toEqual([3])
		expect(initializers[2].getFloatDataList()).toEqual([4])
		expect(initializers[3].getFloatDataList()).toEqual([5])
		expect(initializers[4].getFloatDataList()).toEqual([1])
		expect(initializers[5].getFloatDataList()).toEqual([2])
		expect(initializers[6].getFloatDataList()).toEqual([3])
	})

	test('no b', () => {
		const model = ONNXExporter.createONNXModel()
		pau.export(model, { type: 'pau', input: 'x', m: 2, n: 0 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(4)
		expect(nodes[0].getOpType()).toBe('Mul')
		expect(nodes[1].getOpType()).toBe('Sum')
		expect(nodes[2].getOpType()).toBe('Mul')
		expect(nodes[3].getOpType()).toBe('Mul')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(3)
		expect(initializers[0].getFloatDataList()).toEqual([0.1])
		expect(initializers[1].getFloatDataList()).toEqual([0.1])
		expect(initializers[2].getFloatDataList()).toEqual([0.1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { m: 2, n: 4 }, { a: [2, 3, 4, 5], b: [1, 2, 3] }, { m: 2, n: 0 }])('pau %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'pau', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._pau
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PauLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
