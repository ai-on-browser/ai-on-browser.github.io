import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import round from '../../../../../../lib/model/nns/onnx/layer/round.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %p', input => {
		const model = ONNXExporter.createONNXModel()
		round.export(model, { type: 'round', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Round')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('round', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'round' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._round
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'round' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
