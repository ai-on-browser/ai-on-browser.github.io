import { randIndex } from '../../../lib/evaluate/clustering.js'
import Squeezer from '../../../lib/model/squeezer.js'

describe('predict', () => {
	test('fit', { retry: 5 }, () => {
		const model = new Squeezer(0.5)
		const n = 50
		const x = []
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				const r = Math.floor(Math.random() * 3)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			}
			x.push(xi)
		}
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				const r = Math.floor(Math.random() * 3 + 2)
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
			}
			x.push(xi)
		}
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.8)
	})

	test('change sim max', () => {
		const model = new Squeezer(0.5)
		const x = [
			['b', 'c', 'c'],
			['a', 'c', 'b'],
			['c', 'b', 'c'],
			['a', 'a', 'c'],
			['c', 'c', 'c'],
			['c', 'c', 'd'],
			['c', 'd', 'd'],
			['d', 'd', 'e'],
			['c', 'c', 'c'],
			['d', 'd', 'c'],
		]
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThanOrEqual(0.6)
	})
})
