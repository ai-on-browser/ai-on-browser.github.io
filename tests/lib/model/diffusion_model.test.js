import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import Tensor from '../../../lib/util/tensor.js'
import DiffusionModel from '../../../lib/model/diffusion_model.js'

describe('sample', () => {
	test('2d custom layers', async () => {
		const model = new DiffusionModel(100, [
			{ type: 'full', out_size: 8, l2_decay: 0.001, activation: 'tanh' },
			{ type: 'full', out_size: 4, l2_decay: 0.001, activation: 'tanh' },
			{ type: 'full', out_size: 8, l2_decay: 0.001, activation: 'tanh' },
		])
		const x = Matrix.randn(1000, 2, 2, 0.1).toArray()
		for (let i = 0; i < 10; i++) {
			const loss = model.fit(x, 10, 0.01, 10)
			expect(model.epoch).toBe(10 * (i + 1))
			const s = Matrix.fromArray(model.generate(100))
			const curMean = s.mean()
			const curStd = s.std()
			if (loss[0] < 1 && Math.abs(curMean - 2) < 0.5 && curStd < 0.5) {
				break
			}
		}

		const s = Matrix.fromArray(model.generate(100))
		expect(s.mean()).toBeCloseTo(2, 0)
	})

	test('2d default layers', async () => {
		const model = new DiffusionModel(10)
		const x = Matrix.randn(5, 2, 2, 0.1).toArray()
		for (let i = 0; i < 1; i++) {
			const loss = model.fit(x, 2, 0.01, 10)
			expect(loss[0]).not.toBeNaN()
			expect(model.epoch).toBe(2 * (i + 1))
		}

		const s = Matrix.fromArray(model.generate(100))
		expect(s.mean()).not.toBeNaN()
	})

	test('3d default layers', async () => {
		const model = new DiffusionModel(10)
		const x = Tensor.randn([5, 4, 2], 2, 0.1).toArray()
		for (let i = 0; i < 2; i++) {
			const loss = model.fit(x, 1, 0.01, 10)
			expect(loss[0]).not.toBeNaN()
			expect(model.epoch).toBe(i + 1)
		}

		const s = Tensor.fromArray(model.generate(10))
		expect(s.reduce((s, v) => s + v, 0) / s.length).not.toBeNaN()
	})

	test('3d custom layers', async () => {
		const model = new DiffusionModel(10, [
			{ type: 'conv', kernel: 3, channel: 4, padding: 1, l2_decay: 0.001, activation: 'relu' },
			{ type: 'conv', kernel: 3, channel: 4, padding: 1, l2_decay: 0.001, activation: 'relu' },
		])
		const x = Tensor.randn([5, 4, 2], 2, 0.1).toArray()
		for (let i = 0; i < 2; i++) {
			const loss = model.fit(x, 1, 0.01, 10)
			expect(loss[0]).not.toBeNaN()
			expect(model.epoch).toBe(i + 1)
		}

		const s = Tensor.fromArray(model.generate(10))
		expect(s.reduce((s, v) => s + v, 0) / s.length).not.toBeNaN()
	})
})
