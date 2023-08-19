import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import plu from '../../../../../../lib/model/nns/onnx/layer/plu.js'
import PluLayer from '../../../../../../lib/model/nns/layer/plu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test.each([{ input: 'x' }, { input: ['x'], alpha: 0.2, c: 3 }])('%p', param => {
		const model = ONNXExporter.createONNXModel()
		plu.export(model, { type: 'plu', ...param })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(8)
		expect(nodes[0].getOpType()).toBe('Add')
		expect(nodes[1].getOpType()).toBe('Mul')
		expect(nodes[2].getOpType()).toBe('Sub')
		expect(nodes[3].getOpType()).toBe('Sub')
		expect(nodes[4].getOpType()).toBe('Mul')
		expect(nodes[5].getOpType()).toBe('Add')
		expect(nodes[6].getOpType()).toBe('Min')
		expect(nodes[7].getOpType()).toBe('Max')
		const initializers = model.getGraph().getInitializerList()
		expect(initializers).toHaveLength(2)
		expect(initializers[0].getFloatDataList()).toEqual([param.alpha ?? 0.1])
		expect(initializers[1].getFloatDataList()).toEqual([param.c ?? 1])
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([{}, { alpha: 0.2, c: 3 }])('plu %p', async param => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3] },
			{ type: 'plu', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._plu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new PluLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
