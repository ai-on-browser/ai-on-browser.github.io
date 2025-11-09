import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import transpose from '../../../../../../lib/model/nns/onnx/layer/transpose.js'
import TransposeLayer from '../../../../../../lib/model/nns/layer/transpose.js'
import Tensor from '../../../../../../lib/util/tensor.js'

describe('export', () => {
	test.each([
		[{ input: 'x', axis: [1, 0] }, [2, 3], [3, 2]],
		[{ input: ['x'], axis: [1, 2, 0] }, [2, 3, 4], [3, 4, 2]],
	])('%j', (param, inSize, outSize) => {
		const model = ONNXExporter.createONNXModel()
		const info = transpose.export(model, { type: 'transpose', ...param }, { x: { size: inSize } })
		expect(info.size).toEqual(outSize)
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Transpose')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		[{ axis: [0, 1] }, [null, 3], [100, 3], [100, 3]],
		[{ axis: [1, 0] }, [null, 3], [100, 3], [3, 100]],
		[{ axis: [2, 1, 0] }, [1, 2, 3], [1, 2, 3], [3, 2, 1]],
		[{ axis: [2, 0, 1] }, [1, 2, 3], [1, 2, 3], [3, 1, 2]],
	])('transpose %j %j %j %j', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: inSize },
			{ type: 'transpose', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Tensor.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._transpose
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new TransposeLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(t.value[i])
		}
	})
})
