import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import rrelu from '../../../../../../lib/model/nns/onnx/layer/rrelu.js'
import RreluLayer from '../../../../../../lib/model/nns/layer/rrelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], l: 1, u: 2 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		rrelu.export(model, { type: 'rrelu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('LeakyRelu')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { l: 1, u: 2 }])('rrelu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'rrelu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._rrelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new RreluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
