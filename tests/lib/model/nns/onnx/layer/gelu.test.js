import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import gelu from '../../../../../../lib/model/nns/onnx/layer/gelu.js'
import Layer from '../../../../../../lib/model/nns/layer/base.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	describe('opset version 19', () => {
		test.each(['x', ['x']])('input %p', input => {
			const model = ONNXExporter.createONNXModel()
			gelu.export(model, { type: 'gelu', input })
			const nodes = model.getGraph().getNodeList()
			expect(nodes).toHaveLength(33)
			expect(nodes[0].getOpType()).toBe('Constant')
			expect(nodes[1].getOpType()).toBe('Constant')
			expect(nodes[2].getOpType()).toBe('Constant')
			expect(nodes[3].getOpType()).toBe('Constant')
			expect(nodes[4].getOpType()).toBe('Constant')
			expect(nodes[5].getOpType()).toBe('Constant')
			expect(nodes[6].getOpType()).toBe('Constant')
			expect(nodes[7].getOpType()).toBe('Constant')
			expect(nodes[8].getOpType()).toBe('Sqrt')
			expect(nodes[9].getOpType()).toBe('Div')
			expect(nodes[10].getOpType()).toBe('Abs')
			expect(nodes[11].getOpType()).toBe('Mul')
			expect(nodes[12].getOpType()).toBe('Add')
			expect(nodes[13].getOpType()).toBe('Reciprocal')
			expect(nodes[14].getOpType()).toBe('Mul')
			expect(nodes[15].getOpType()).toBe('Add')
			expect(nodes[16].getOpType()).toBe('Mul')
			expect(nodes[17].getOpType()).toBe('Add')
			expect(nodes[18].getOpType()).toBe('Mul')
			expect(nodes[19].getOpType()).toBe('Add')
			expect(nodes[20].getOpType()).toBe('Mul')
			expect(nodes[21].getOpType()).toBe('Add')
			expect(nodes[22].getOpType()).toBe('Mul')
			expect(nodes[23].getOpType()).toBe('Pow')
			expect(nodes[24].getOpType()).toBe('Neg')
			expect(nodes[25].getOpType()).toBe('Exp')
			expect(nodes[26].getOpType()).toBe('Mul')
			expect(nodes[27].getOpType()).toBe('Sub')
			expect(nodes[28].getOpType()).toBe('Sign')
			expect(nodes[29].getOpType()).toBe('Mul')
			expect(nodes[30].getOpType()).toBe('Add')
			expect(nodes[31].getOpType()).toBe('Mul')
			expect(nodes[32].getOpType()).toBe('Div')
		})
	})

	describe('opset version 20', () => {
		test.each(['x', ['x']])('input %p', input => {
			const model = ONNXExporter.createONNXModel()
			model.getOpsetImportList()[0].setVersion(20)
			gelu.export(model, { type: 'gelu', input })
			const nodes = model.getGraph().getNodeList()
			expect(nodes).toHaveLength(1)
			expect(nodes[0].getOpType()).toBe('Gelu')
		})
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('gelu', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 3] }, { type: 'gelu' }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 3)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._gelu
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = Layer.fromObject({ type: 'gelu' }).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
