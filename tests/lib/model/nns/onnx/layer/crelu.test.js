import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import crelu from '../../../../../../lib/model/nns/onnx/layer/crelu.js'
import CReluLayer from '../../../../../../lib/model/nns/layer/crelu.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		const info = crelu.export(model, { type: 'crelu', input: 'x' }, { x: { size: [null, 3] } })
		expect(info).toEqual({ size: [null, 6] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(4)
		expect(nodes[0].getOpType()).toBe('Relu')
		expect(nodes[1].getOpType()).toBe('Neg')
		expect(nodes[2].getOpType()).toBe('Relu')
		expect(nodes[3].getOpType()).toBe('Concat')
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = crelu.export(model, { type: 'crelu', input: ['x'] }, { x: { size: [10, null] } })
		expect(info).toEqual({ size: [10, null] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(4)
		expect(nodes[0].getOpType()).toBe('Relu')
		expect(nodes[1].getOpType()).toBe('Neg')
		expect(nodes[2].getOpType()).toBe('Relu')
		expect(nodes[3].getOpType()).toBe('Concat')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('crelu', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'crelu' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._crelu
		expect(yten.dims).toEqual([100, 6])
		const y = await yten.getData(true)

		const t = new CReluLayer({}).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})

	test('crelu with null size axis', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, null] }, { type: 'crelu' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._crelu
		expect(yten.dims).toEqual([100, 6])
		const y = await yten.getData(true)

		const t = new CReluLayer({}).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
