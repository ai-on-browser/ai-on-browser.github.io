import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import PsfLayer from '../../../../../../lib/model/nns/layer/psf.js'
import psf from '../../../../../../lib/model/nns/onnx/layer/psf.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], m: 3 }])('%j', param => {
		const model = ONNXExporter.createONNXModel()
		psf.export(model, { type: 'psf', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('Sigmoid')
		expect(nodes[1].getOpType()).toBe('Pow')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(1)
		expect(initializers[0].getFloatDataList()).toEqual([param.m ?? 2])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { m: 3 }])('psf %j', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'psf', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._psf
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PsfLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
