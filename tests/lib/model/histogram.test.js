import { correlation } from '../../../lib/evaluate/regression.js'
import Histogram from '../../../lib/model/histogram.js'
import Matrix from '../../../lib/util/matrix.js'

test('default', () => {
	const model = new Histogram()
	const n = 1000
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.5), Matrix.randn(n, 2, 5, 0.5)).toArray()
	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const p = []
	for (let i = 0; i < x.length; i++) {
		const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.5)) / (2 * Math.PI * 0.5)
		const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.5)) / (2 * Math.PI * 0.5)
		p[i] = (p1 + p2) / 2
	}
	const corr = correlation(y, p)
	expect(corr).toBeGreaterThan(0.8)
})

test('range', () => {
	const model = new Histogram({
		range: [
			[-1, -0.5, 0, 0.5, 1],
			[-1, -0.5, 0, 0.5, 1],
		],
	})
	const x = []
	for (let i = -10; i < 10; i++) {
		for (let j = -10; j < 10; j++) {
			x.push([i / 10 + 0.05, j / 10 + 0.05])
		}
	}
	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < x.length; i++) {
		expect(y[i]).toBe(25)
	}
})

test('domain', () => {
	const model = new Histogram({
		domain: [
			[-1, 1],
			[-1, 1],
		],
	})
	const n = 1000
	const x = Matrix.random(n, 2, -1, 1).toArray()
	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
})

describe('size', () => {
	test('scalar', () => {
		const model = new Histogram({
			domain: [
				[-1, 1],
				[-1, 1],
			],
			size: 0.5,
		})
		const x = []
		for (let i = -10; i < 10; i++) {
			for (let j = -10; j < 10; j++) {
				x.push([i / 10 + 0.05, j / 10 + 0.05])
			}
		}
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBe(25)
		}
	})

	test('array', () => {
		const model = new Histogram({
			domain: [
				[-1, 1],
				[-1, 1],
			],
			size: [0.5, 0.2],
		})
		const x = []
		for (let i = -10; i < 10; i++) {
			for (let j = -10; j < 10; j++) {
				x.push([i / 10 + 0.05, j / 10 + 0.05])
			}
		}
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBe(10)
		}
	})
})

describe('count', () => {
	test('scalar', () => {
		const model = new Histogram({
			domain: [
				[-1, 1],
				[-1, 1],
			],
			count: 4,
		})
		const x = []
		for (let i = -10; i < 10; i++) {
			for (let j = -10; j < 10; j++) {
				x.push([i / 10 + 0.05, j / 10 + 0.05])
			}
		}
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBe(25)
		}
	})

	test('array', () => {
		const model = new Histogram({
			domain: [
				[-1, 1],
				[-1, 1],
			],
			count: [4, 10],
		})
		const x = []
		for (let i = -10; i < 10; i++) {
			for (let j = -10; j < 10; j++) {
				x.push([i / 10 + 0.05, j / 10 + 0.05])
			}
		}
		model.fit(x)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBe(10)
		}
	})
})

test.each(['fd', 'scott', 'rice', 'sturges', 'doane', 'sqrt'])('bin method %s', { retry: 3 }, method => {
	const model = new Histogram({ binMethod: method })
	const n = 1000
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.5), Matrix.randn(n, 2, 5, 0.5)).toArray()
	model.fit(x)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const p = []
	for (let i = 0; i < x.length; i++) {
		const p1 = Math.exp(-x[i].reduce((s, v) => s + v ** 2, 0) / (2 * 0.5)) / (2 * Math.PI * 0.5)
		const p2 = Math.exp(-x[i].reduce((s, v) => s + (v - 5) ** 2, 0) / (2 * 0.5)) / (2 * Math.PI * 0.5)
		p[i] = (p1 + p2) / 2
	}
	const corr = correlation(y, p)
	expect(corr).toBeGreaterThan(0.8)
})

test('outside', () => {
	const model = new Histogram()
	const n = 1000
	const x = Matrix.random(n, 2, -1, 1).toArray()
	model.fit(x)
	const y = model.predict([
		[-2, -2],
		[2, 2],
	])
	expect(y[0]).toBe(0)
	expect(y[1]).toBe(0)
})
