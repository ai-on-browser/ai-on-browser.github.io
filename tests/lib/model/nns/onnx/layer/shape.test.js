import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import ShapeLayer from '../../../../../../lib/model/nns/layer/shape.js'
import shape from '../../../../../../lib/model/nns/onnx/layer/shape.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %j', input => {
		const model = ONNXExporter.createONNXModel()
		shape.export(model, { type: 'shape', input }, { x: { size: [null, 2, 3] } })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Shape')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('shape', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'shape' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._shape
		expect(yten.dims).toEqual([2])
		const y = await yten.getData(true)

		const t = ShapeLayer.fromObject({ type: 'shape' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(BigInt(t.value[i]))
		}
	})
})
