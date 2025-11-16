import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import isigmoid from '../../../../../../lib/model/nns/onnx/layer/isigmoid.js'
import IsigmoidLayer from '../../../../../../lib/model/nns/layer/isigmoid.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		isigmoid.export(model, { type: 'isigmoid', input: 'x' })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(9)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Constant')
		expect(nodes[2].getOpType()).toBe('Shrink')
		expect(nodes[3].getOpType()).toBe('Add')
		expect(nodes[4].getOpType()).toBe('Mul')
		expect(nodes[5].getOpType()).toBe('Abs')
		expect(nodes[6].getOpType()).toBe('Greater')
		expect(nodes[7].getOpType()).toBe('Sigmoid')
		expect(nodes[8].getOpType()).toBe('Where')
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		isigmoid.export(model, { type: 'isigmoid', input: ['x'], a: 2, alpha: 3 })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(10)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Constant')
		expect(nodes[2].getOpType()).toBe('Constant')
		expect(nodes[3].getOpType()).toBe('Shrink')
		expect(nodes[4].getOpType()).toBe('Add')
		expect(nodes[5].getOpType()).toBe('Mul')
		expect(nodes[6].getOpType()).toBe('Abs')
		expect(nodes[7].getOpType()).toBe('Greater')
		expect(nodes[8].getOpType()).toBe('Sigmoid')
		expect(nodes[9].getOpType()).toBe('Where')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { a: 2, alpha: 3 }])('isigmoid %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'isigmoid', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._isigmoid
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new IsigmoidLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
