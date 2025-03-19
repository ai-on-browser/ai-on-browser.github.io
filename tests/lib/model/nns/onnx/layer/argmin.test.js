import * as ort from 'onnxruntime-web'
ort.env.wasm.numThreads = 1

import ONNXExporter, { onnx } from '../../../../../../lib/model/nns/onnx/onnx_exporter.js'
import argmin from '../../../../../../lib/model/nns/onnx/layer/argmin.js'
import ArgminLayer from '../../../../../../lib/model/nns/layer/argmin.js'
import Matrix from '../../../../../../lib/util/matrix.js'

describe('export', () => {
	test('default', () => {
		const model = ONNXExporter.createONNXModel()
		const info = argmin.export(model, { type: 'argmin', input: 'x' }, { x: { size: [null, null] } })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.INT64, size: [null, 1] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ArgMin')
		expect(nodes[0].getAttributeList()[0].getI()).toBe(-1)
		expect(nodes[0].getAttributeList()[1].getI()).toBe(1)
	})

	test('array input', () => {
		const model = ONNXExporter.createONNXModel()
		const info = argmin.export(model, { type: 'argmin', input: ['x'] }, { x: { size: [null, null] } })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.INT64, size: [null, 1] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ArgMin')
		expect(nodes[0].getAttributeList()[0].getI()).toBe(-1)
		expect(nodes[0].getAttributeList()[1].getI()).toBe(1)
	})

	test('keepdims false', () => {
		const model = ONNXExporter.createONNXModel()
		const info = argmin.export(model, { type: 'argmin', input: ['x'], keepdims: false }, { x: { size: [2, 3] } })
		expect(info).toEqual({ type: onnx.TensorProto.DataType.INT64, size: [2] })
		const nodes = model.getGraph().getNodeList()
		expect(nodes).toHaveLength(1)
		expect(nodes[0].getOpType()).toBe('ArgMin')
		expect(nodes[0].getAttributeList()[0].getI()).toBe(-1)
		expect(nodes[0].getAttributeList()[1].getI()).toBe(0)
	})
})

describe('runtime', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test.each([
		[{}, [null, 3], [100, 3], [100, 1]],
		[{ axis: 0 }, [null, 3], [100, 3], [1, 3]],
		[{ keepdims: false }, [null, 3], [100, 3], [100]],
	])('argmin %p %p %p %p', async (param, inSize, actualSize, outSize) => {
		const buf = ONNXExporter.dump([
			{ type: 'input', size: inSize },
			{ type: 'argmin', ...param },
			{ type: 'output' },
		])
		session = await ort.InferenceSession.create(buf)

		const x = Matrix.randn(actualSize)
		const xten = new ort.Tensor('float32', x.value, x.sizes)
		const out = await session.run({ _input: xten })
		const yten = out._argmin
		expect(yten.dims).toEqual(outSize)
		const y = await yten.getData(true)

		const t = new ArgminLayer(param).calc(x)
		expect(yten.dims).toEqual(t.sizes)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBe(BigInt(t.value[i]))
		}
	})
})
