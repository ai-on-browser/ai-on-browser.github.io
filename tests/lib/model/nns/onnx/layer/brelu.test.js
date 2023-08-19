import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import brelu from '../../../../../../lib/model/nns/onnx/layer/brelu.js'
import BReluLayer from '../../../../../../lib/model/nns/layer/brelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], a: 2 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		brelu.export(model, { type: 'brelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(3)
		expect(nodes[0].getOpType()).toBe('Constant')
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

	test.each([{}, { a: 2 }])('brelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'brelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._brelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new BReluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
