import * as ort from 'onnxruntime-web'

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import equal from '../../../../../../lib/model/nns/onnx/layer/equal.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = equal.export(model, { type: 'equal', input: ['x', 'y'] })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Equal')
	})

	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => equal.export(model, { type: 'equal', input: 'x' })).toThrow("Invalid attribute 'input'")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('equal', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', name: 'x1', size: [null, 3] },
			{ type: 'input', name: 'x2', size: [null, 3] },
			{ type: 'equal', input: ['x1', 'x2'] },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x1 = Matrix.randint(100, 3)
		const x1ten = new ort.Tensor('float32', x1.value, x1.sizes)
		const x2 = Matrix.randint(100, 3)
		const x2ten = new ort.Tensor('float32', x2.value, x2.sizes)
		const out = await session.run({ x1: x1ten, x2: x2ten })
		const yten = out._equal
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'equal' }).calc(x1, x2)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(+t.value[i])
		}
	})
})
