import * as ort from 'onnxruntime-web'

ort.env.wasm.numThreads = 1

import constant from '../../../../../../lib/model/nns/onnx/layer/const.js'
import ONNXExporter from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'

describe('export', () => {
	test('1d array', () => {
		const model = ONNXExporter.createONNXModel()
		constant.export(model, { type: 'const', value: [1] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('Constant')
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('const 1d', async () => {
		const buf = ONNXExporter.dump([{ type: 'const', value: [1] }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const out = await session.run({})
		const yten = out._const
		expect(yten.dims).toEqual([1])
		const values = await yten.getData()
		expect(values.at(0)).toEqual(1)
	})

	test('const 2d', async () => {
		const value = [
			[1, 2],
			[3, 4],
		]
		const buf = ONNXExporter.dump([{ type: 'const', value: value }, { type: 'output' }])
		session = await ort.InferenceSession.create(buf)

		const out = await session.run({})
		const yten = out._const
		expect(yten.dims).toEqual([2, 2])
		const y = await yten.getData(true)
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				expect(y[i * 2 + j]).toBeCloseTo(value[i][j])
			}
		}
	})
})
