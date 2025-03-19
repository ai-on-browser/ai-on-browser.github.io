import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import input from '../../../../../../lib/model/nns/onnx/layer/input.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		const info = input.export(model, { type: 'input', size: [null, 1] })
		expect(info).toEqual({
			type: onnx.TensorProto.DataType.FLOAT,
			size: [null, 1],
		})
		const inputNodes = model.getGraph().getInputList()
		expect(inputNodes).toHaveLength(1)
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(0)
	})

	test('no size', () => {
		const model = ONNXExporter.createONNXModel()
		expect(() => input.export(model, { type: 'input' })).toThrow('Input layer must specify the size')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('input', async () => {
		const buf = ONNXExporter.dump([{ type: 'input', size: [null, 5] }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(100, 5)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._input
		expect(yten.dims).toEqual([100, 5])
		const y = await yten.getData(true)

		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(+x.value[i])
		}
	})
})
