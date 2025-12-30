import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import Layer from '../../../../../../lib/model/nns/layer/base.js'
import is_inf from '../../../../../../lib/model/nns/onnx/layer/is_inf.js'
import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %j', input => {
		const model = ONNXExporter.createONNXModel()
		const info = is_inf.export(model, { type: 'is_inf', input })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.BOOL })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('IsInf')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('is_inf', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 4] }, { type: 'is_inf' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._is_inf
		expect(yten.dims).toEqual([1, 4])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'is_inf' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(+t.value[i])
		}
	})
})
