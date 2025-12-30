import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import FlattenLayer from '../../../../../../lib/model/nns/layer/flatten.js'
import flatten from '../../../../../../lib/model/nns/onnx/layer/flatten.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		const info = flatten.export(model, { type: 'flatten', input: 'x' }, { x: { size: [null, 3, 5] } })
		expect(info).toEqual({ size: [null, 15] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Flatten')
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = flatten.export(model, { type: 'flatten', input: ['x'] }, { x: { size: [10, 8, null] } })
		expect(info).toEqual({ size: [10, null] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Flatten')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('flatten', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3, 4] }, { type: 'flatten' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn([100, 3, 4])
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._flatten
		expect(yten.dims).toEqual([100, 12])
		const y = await yten.getData(true)

		const t = new FlattenLayer({}).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
