import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import bent_identity from '../../../../../../lib/model/nns/onnx/layer/bent_identity.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %p', input => {
		const model = ONNXExporter.createONNXModel()
		bent_identity.export(model, { type: 'bent_identity', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(8)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Constant')
		expect(nodes[2].getOpType()).toBe('Pow')
		expect(nodes[3].getOpType()).toBe('Add')
		expect(nodes[4].getOpType()).toBe('Sqrt')
		expect(nodes[5].getOpType()).toBe('Sub')
		expect(nodes[6].getOpType()).toBe('Div')
		expect(nodes[7].getOpType()).toBe('Add')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('bent_identity', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'bent_identity' },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._bent_identity
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'bent_identity' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
