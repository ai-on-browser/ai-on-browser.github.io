import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import { LSDD, LSDDCPD } from '../../../lib/model/lsdd.js'

test('lsdd', () => {
	const sigmas = []
	const lambdas = []
	for (let i = -2; i <= 0; i += 0.5) {
		sigmas.push(10 ** i)
		lambdas.push(10 ** i)
	}
	const model = new LSDD(sigmas, lambdas)

	const x1 = Matrix.randn(150, 1, 0, 0.2).toArray()
	const x2 = Matrix.randn(100, 1, 2, 0.2).toArray()
	const x3 = Matrix.randn(50, 1, 0, 0.2).toArray()

	model.fit(x1, x2)
	const r1 = model.predict(x1).reduce((s, v) => s + v ** 2, 0) / x1.length
	model.fit(x1, x3)
	const r2 = model.predict(x1).reduce((s, v) => s + v ** 2, 0) / x1.length

	expect(r1).toBeGreaterThan(r2)
})

test('change point detection', () => {
	const w = 10
	const model = new LSDDCPD(w)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.001), Matrix.randn(n, 1, 0.1, 0.001)).toArray()
	const p = model.predict(x)

	const threshold = 500
	const range = w * 2
	let c = 0
	for (let i = 0; i < p.length; i++) {
		if (i <= n && n - range <= i) {
			if (p[i] >= threshold) {
				c++
			}
			continue
		}
		expect(p[i]).toBeLessThan(threshold)
	}
	expect(c).toBeGreaterThan(0)
})
