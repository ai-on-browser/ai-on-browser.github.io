import { jest } from '@jest/globals'
jest.retryTimes(3)

import { Matrix } from '../../../lib/util/math.js'
import Histogram from '../../../lib/model/histogram.js'

import { correlation } from '../../../lib/evaluate/regression.js'

test('default', () => {
	const model = new Histogram()
	const n = 1000
	const x = Matrix.randn(n, 2, 0, 0.5).concat(Matrix.randn(n, 2, 5, 0.5)).toArray()
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

test.each(['fd', 'scott', 'rice', 'sturges', 'doane', 'sqrt'])('bin method %s', method => {
	const model = new Histogram({ binMethod: method })
	const n = 1000
	const x = Matrix.randn(n, 2, 0, 0.5).concat(Matrix.randn(n, 2, 5, 0.5)).toArray()
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
