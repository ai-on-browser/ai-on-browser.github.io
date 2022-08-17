import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import Tensor from '../../../lib/util/tensor.js'
import { HMM, ContinuousHMM, HMMClassifier } from '../../../lib/model/hmm.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('hmm', () => {
	test.each([undefined, true, false])('scaled:%p', scaled => {
		const model = new HMM(5)
		const x = [['sunny', 'cloudy', 'rainy', 'sunny', 'sunny']]
		model.fit(x, scaled)
		const oldProb = model.probability(x)
		for (let i = 0; i < 10; i++) {
			model.fit(x, scaled)
		}
		const newProb = model.probability(x)
		expect(newProb[0]).toBeGreaterThan(oldProb[0])
	})

	test('bestpath', () => {
		const model = new HMM(5)
		const x = [['sunny', 'cloudy', 'rainy', 'sunny', 'sunny']]
		model.fit(x, true)

		const path = model.bestPath(x)
		expect(path).toHaveLength(x.length)
		for (let i = 0; i < x.length; i++) {
			expect(path[i]).toHaveLength(x[i].length)
			for (let j = 0; j < x[i].length; j++) {
				expect(path[i][j]).toBeGreaterThanOrEqual(0)
				expect(path[i][j]).toBeLessThanOrEqual(4)
			}
		}
	})
})

describe('continuous hmm', () => {
	test.each([undefined, true, false])('continuous hmm scaled:%p', scaled => {
		const model = new ContinuousHMM(3, 2)
		const x = Tensor.randn([10, 7, 2]).toArray()
		model.fit(x, scaled)
		const oldProb = model.probability(x).reduce((s, v) => s + v, 0)
		for (let i = 0; i < 10; i++) {
			model.fit(x, scaled)
		}
		const newProb = model.probability(x).reduce((s, v) => s + v, 0)
		expect(newProb).toBeGreaterThan(oldProb)
	})

	test('bestpath', () => {
		const model = new ContinuousHMM(5, 2)
		const x = Tensor.randn([10, 7, 2]).toArray()
		model.fit(x, true)

		const path = model.bestPath(x)
		expect(path).toHaveLength(x.length)
		for (let i = 0; i < x.length; i++) {
			expect(path[i]).toHaveLength(x[i].length)
			for (let j = 0; j < x[i].length; j++) {
				expect(path[i][j]).toBeGreaterThanOrEqual(0)
				expect(path[i][j]).toBeLessThanOrEqual(4)
			}
		}
	})

	test('generate', () => {
		const model = new ContinuousHMM(5, 2)
		const x = Tensor.randn([10, 7, 2]).toArray()
		model.fit(x, true)

		const gen = model.generate(10000, 3)
		expect(gen).toHaveLength(10000)

		const v = []
		for (let i = 0; i < gen.length; i++) {
			expect(gen[i]).toHaveLength(3)
			for (let j = 0; j < gen[i].length; j++) {
				expect(gen[i][j]).toHaveLength(2)
				v.push(...gen[i][j])
			}
		}
		const mean = v.reduce((s, v) => s + v, 0) / v.length
		const vari = v.reduce((s, v) => s + (v - mean) ** 2, 0) / v.length
		expect(mean).toBeCloseTo(0, 1)
		expect(vari).toBeCloseTo(1, 0)
	})
})

test('classifier', () => {
	const model = new HMMClassifier(['a', 'b'], 5)
	const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x, t, i % 2 === 0)
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.95)
})
