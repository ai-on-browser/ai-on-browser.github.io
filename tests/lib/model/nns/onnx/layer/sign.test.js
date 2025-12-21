import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import Layer from '../../../../../../lib/model/nns/layer/base.js'
import sign from '../../../../../../lib/model/nns/onnx/layer/sign.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %j', input => {
		const model = ONNXExporter.createONNXModel()
		sign.export(model, { type: 'sign', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Sign')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('sign', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 5] }, { type: 'sign' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = new Matrix(1, 5, [-1.5, -1, 0, 1, 1.5])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._sign
		expect(yten.dims).toEqual([1, 5])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'sign' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
