import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import not from '../../../../../../lib/model/nns/onnx/layer/not.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('string input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = not.export(model, { type: 'not', input: 'x' }, { x: { type: onnx.TensorProto.DataType.FLOAT } })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[1].getOpType()).toBe('Not')
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = not.export(model, { type: 'not', input: ['x'] }, { x: { type: onnx.TensorProto.DataType.BOOL } })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Not')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('not', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'not' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		x.map(v => +(v < 0))
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._not
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'not' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(+t.value[i])
		}
	})
})
