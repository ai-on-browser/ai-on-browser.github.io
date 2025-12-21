import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import Layer from '../../../../../../lib/model/nns/layer/base.js'
import hard_elish from '../../../../../../lib/model/nns/onnx/layer/hard_elish.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %j', input => {
		const model = ONNXExporter.createONNXModel()
		hard_elish.export(model, { type: 'hard_elish', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Elu')
		expect(nodes[1].getOpType()).toBe('HardSigmoid')
		expect(nodes[2].getOpType()).toBe('Mul')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('hard_elish', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'hard_elish' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._hard_elish
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'hard_elish' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
