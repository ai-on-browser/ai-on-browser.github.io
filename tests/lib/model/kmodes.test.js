import { jest } from '@jest/globals'
jest.retryTimes(5)

import KModes from '../../../lib/model/kmodes.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

describe('predict', () => {
	test('fit', () => {
		const model = new KModes()
		const n = 50
		const x = []
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				const r = Math.floor(Math.random() * 10)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			}
			x.push(xi)
		}
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				const r = Math.floor(Math.random() * 10 + 9)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			}
			x.push(xi)
		}

		model.add(x)
		model.add(x)

		for (let i = 0; i < 100; i++) {
			const d = model.fit(x)
			if (d === 0) {
				break
			}
		}
		expect(model.size).toBe(2)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('clear', () => {
		const model = new KModes()
		const x = [
			['a', 'b'],
			['b', 'a'],
		]

		model.add(x)
		model.add(x)
		model.fit(x)
		expect(model.size).toBe(2)
		model.clear()
		expect(model.size).toBe(0)
	})

	test('fit before init', () => {
		const model = new KModes()
		const x = []
		for (let i = 0; i < 50n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				const r = Math.floor(Math.random() * 10)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			}
			x.push(xi)
		}
		const d = model.fit(x)
		expect(d).toBe(0)
	})

	test('before fit', () => {
		const model = new KModes()
		const x = []
		for (let i = 0; i < 50n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				const r = Math.floor(Math.random() * 10)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			}
			x.push(xi)
		}
		expect(() => model.predict(x)).toThrow('Call fit before predict.')
	})
})
