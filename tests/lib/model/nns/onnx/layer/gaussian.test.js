import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import GaussianLayer from '../../../../../../lib/model/nns/layer/gaussian.js'
import gaussian from '../../../../../../lib/model/nns/onnx/layer/gaussian.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each(['x', ['x']])('input %j', input => {
		const model = ONNXExporter.createONNXModel()
		gaussian.export(model, { type: 'gaussian', input })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(5)
		expect(nodes[0].getOpType()).toBe('Constant')
		expect(nodes[1].getOpType()).toBe('Pow')
		expect(nodes[2].getOpType()).toBe('Neg')
		expect(nodes[3].getOpType()).toBe('Div')
		expect(nodes[4].getOpType()).toBe('Exp')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('gaussian', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'gaussian' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._gaussian
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new GaussianLayer({}).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
