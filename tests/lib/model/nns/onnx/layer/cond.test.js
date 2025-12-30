import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import CondLayer from '../../../../../../lib/model/nns/layer/cond.js'
import cond from '../../../../../../lib/model/nns/onnx/layer/cond.js'
import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('float condition', () => {
		const model = ONNXExporter.createONNXModel()
		const info = cond.export(
			model,
			{ type: 'cond', input: ['c', 't', 'f'] },
			{ c: { type: onnx.TensorProto.DataType.FLOAT }, t: { type: onnx.TensorProto.DataType.FLOAT } }
		)
		expect(info).toEqual({ type: onnx.TensorProto.DataType.FLOAT })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(2)
		expect(nodes[0].getOpType()).toBe('Cast')
		expect(nodes[1].getOpType()).toBe('Where')
	})

	test('bool condition', () => {
		const model = ONNXExporter.createONNXModel()
		const info = cond.export(
			model,
			{ type: 'cond', input: ['c', 't', 'f'] },
			{ c: { type: onnx.TensorProto.DataType.BOOL }, t: { type: onnx.TensorProto.DataType.FLOAT } }
		)
		expect(info).toEqual({ type: onnx.TensorProto.DataType.FLOAT })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Where')
	})

	test.each(['x', ['a', 'b']])('invalid input %j', i => {
		const model = ONNXExporter.createONNXModel()
		expect(() => cond.export(model, { type: 'cond', input: i })).toThrow("Invalid attribute 'input'")
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('cond', async () => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: [null, 3], name: 'c' },
			{ type: 'input', size: [null, 3], name: 't' },
			{ type: 'input', size: [null, 3], name: 'f' },
			{ type: 'cond', input: ['c', 't', 'f'] },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const xt = Matrix.randn(100, 3)
		const xf = Matrix.randn(100, 3)
		const xc = Matrix.randn(100, 3)
		xc.map(v => +(v < 0))

		const xtten = new ort.Tensor('float32', xt.value, xt.sizes)
		const xften = new ort.Tensor('float32', xf.value, xf.sizes)
		const xcten = new ort.Tensor('float32', xc.value, xc.sizes)
		const out = await session.run({ c: xcten, t: xtten, f: xften })
		const yten = out._cond
		expect(yten.dims).toEqual([100, 3])
		const y = await yten.getData(true)

		const t = new CondLayer({}).calc(xc, xt, xf)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
