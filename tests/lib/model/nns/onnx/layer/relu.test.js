import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import relu from '../../../../../../lib/model/nns/onnx/layer/relu.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %p', input => {
		const model = ONNXExporter.createONNXModel()
		relu.export(model, { type: 'relu', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Relu')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('relu', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'relu' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._relu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'relu' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
