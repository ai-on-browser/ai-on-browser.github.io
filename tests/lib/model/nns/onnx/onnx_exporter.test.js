import { jest } from '@jest/globals'
import * as ort from 'onnxruntime-web'

import ONNXExporter from '../../../../../lib/model/nns/onnx/onnx_exporter'

describe('export', () => {
	let session
	afterEach(async () => {
		await session?.release()
		session = null
	})

	test('with name', async () => {
		const nodes = [{ type: 'input', name: 'in', size: [null, null] }, { type: 'tanh' }, { type: 'output' }]
		const buf = ONNXExporter.dump(nodes)
		session = await ort.InferenceSession.create(buf)

		const x = [1, 2, 3, 4]
		const xten = new ort.Tensor('float32', x, [2, 2])
		const out = await session.run({ in: xten })
		const yten = out._tanh
		expect(yten.dims).toEqual([2, 2])
		const y = await yten.getData(true)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(Math.tanh(x[i]))
		}
	})

	test('duplicate layer', async () => {
		const nodes = [{ type: 'input', size: [null, null] }, { type: 'tanh' }, { type: 'tanh' }, { type: 'output' }]
		const buf = ONNXExporter.dump(nodes)
		session = await ort.InferenceSession.create(buf)

		const x = [1, 2, 3, 4]
		const xten = new ort.Tensor('float32', x, [2, 2])
		const out = await session.run({ _input: xten })
		const yten = out._tanh_1
		expect(yten.dims).toEqual([2, 2])
		const y = await yten.getData(true)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toBeCloseTo(Math.tanh(Math.tanh(x[i])))
		}
	})

	describe('broadcast size', () => {
		test.each([[[1, 3]], [[3]]])('dimension %p', async x1size => {
			const nodes = [
				{ type: 'input', size: x1size, name: 'x1' },
				{ type: 'input', size: [5, 3], name: 'x2' },
				{ type: 'add', input: ['x1', 'x2'] },
				{ type: 'output' },
			]
			const buf = ONNXExporter.dump(nodes)
			session = await ort.InferenceSession.create(buf)

			const x1 = [1, 2, 3]
			const x1ten = new ort.Tensor('float32', x1, x1size)
			const x2 = Array.from({ length: 15 }, (_, i) => i)
			const x2ten = new ort.Tensor('float32', x2, [5, 3])
			const out = await session.run({ x1: x1ten, x2: x2ten })
			const yten = out._add
			expect(yten.dims).toEqual([5, 3])
			const values = await yten.getData()
			for (let i = 0, p = 0; i < 5; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(values.at(p)).toBeCloseTo(x1[j] + x2[p])
				}
			}
		})

		test('null dimension size', async () => {
			const nodes = [
				{ type: 'input', size: [null, 3], name: 'x1' },
				{ type: 'input', size: [5, 3], name: 'x2' },
				{ type: 'add', input: ['x1', 'x2'] },
				{ type: 'output' },
			]
			const buf = ONNXExporter.dump(nodes)
			session = await ort.InferenceSession.create(buf)

			const x1 = [1, 2, 3]
			const x1ten = new ort.Tensor('float32', x1, [1, 3])
			const x2 = Array.from({ length: 15 }, (_, i) => i)
			const x2ten = new ort.Tensor('float32', x2, [5, 3])
			const out = await session.run({ x1: x1ten, x2: x2ten })
			const yten = out._add
			expect(yten.dims).toEqual([5, 3])
			const values = await yten.getData()
			for (let i = 0, p = 0; i < 5; i++) {
				for (let j = 0; j < 3; j++, p++) {
					expect(values.at(p)).toBeCloseTo(x1[j] + x2[p])
				}
			}
		})
	})

	describe('console log', () => {
		let orgConsoleError = null
		beforeAll(() => {
			orgConsoleError = console.error
			console.error = jest.fn()
		})

		afterAll(() => {
			console.log = orgConsoleError
		})

		test('noimpl layer', () => {
			const nodes = [
				{ type: 'input', size: [null, null] },
				{ type: 'dummy' },
				{ type: 'tanh' },
				{ type: 'output' },
			]
			ONNXExporter.dump(nodes)
			expect(console.error).toHaveBeenCalledTimes(1)
			expect(console.error).toHaveBeenCalledWith('Unimplemented layer dummy.')
		})
	})
})
