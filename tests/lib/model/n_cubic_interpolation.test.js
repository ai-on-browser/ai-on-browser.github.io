import { jest } from '@jest/globals'
jest.retryTimes(3)

import NCubicInterpolation from '../../../lib/model/n_cubic_interpolation.js'

test('interpolation 1d', () => {
	const model = new NCubicInterpolation()
	const n = 10
	const x = []
	const v = []
	const g = [[]]
	for (let i = 0; i < n; i++) {
		g[0][i] = i + Math.random() / 2 - 0.25
	}
	for (let i = 0; i < n; i++) {
		v[i] = Math.sin((i / (4 * n)) * Math.PI) + (Math.random() - 0.5) / 10
		x.push([g[0][i]])
	}
	model.fit(v, g)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	expect(y[0]).toBeNull()
	expect(y[n - 1]).toBeNull()
	for (let i = 1; i < n - 1; i++) {
		expect(y[i]).toBeCloseTo(v[i])
	}

	const x0 = []
	for (let i = 0; i <= (n - 1) * 4; i++) {
		const i4 = i / 4
		const gi = g[0][Math.floor(i4)] + (i4 - Math.floor(i4)) * (g[0][Math.ceil(i4)] - g[0][Math.floor(i4)])
		x0.push([gi])
	}
	const y0 = model.predict(x0)
	for (let i = 1; i < n - 1; i++) {
		expect(y0[i * 4]).toBeCloseTo(v[i])
	}
	for (let i = 0; i < 4; i++) {
		expect(y0[i]).toBeNull()
	}
	for (let i = 4; i <= (n - 2) * 4; i++) {
		const ps = [v[Math.floor(i / 4)], v[Math.ceil(i / 4)]]
		const l = Math.min(...ps)
		const h = Math.max(...ps)
		expect(y0[i]).toBeGreaterThanOrEqual(l - (h - l) / 1.5)
		expect(y0[i]).toBeLessThanOrEqual(h + (h - l) / 1.5)
	}
	for (let i = (n - 2) * 4 + 1; i <= (n - 1) * 4; i++) {
		expect(y0[i]).toBeNull()
	}

	const yout = model.predict([[g[0][0] - 0.1], [g[0][g[0].length - 1] + 0.1]])
	for (let i = 0; i < yout.length; i++) {
		expect(yout[i]).toBeNull()
	}
})

test('interpolation 2d', () => {
	const model = new NCubicInterpolation()
	const n = 10
	const x = []
	const v = []
	const g = [[], []]
	for (let i = 0; i < n; i++) {
		g[0][i] = i + Math.random() / 2 - 0.25
		g[1][i] = i + Math.random() / 2 - 0.25
	}
	for (let i = 0; i < n; i++) {
		v[i] = []
		for (let j = 0; j < n; j++) {
			v[i][j] = i + j + (Math.random() - 0.5) / 10
			x.push([g[0][i], g[1][j]])
		}
	}
	model.fit(v, g)

	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < n; i++) {
		expect(y[i]).toBeNull()
		expect(y[n ** 2 - i - 1]).toBeNull()
	}
	for (let i = 1, p = n; i < n - 1; i++) {
		expect(y[p++]).toBeNull()
		for (let j = 1; j < n - 1; j++, p++) {
			expect(y[p]).toBeCloseTo(v[i][j])
		}
		expect(y[p++]).toBeNull()
	}

	const x0 = []
	for (let i = 0; i <= (n - 1) * 4; i++) {
		for (let j = 0; j <= (n - 1) * 4; j++) {
			const i4 = i / 4
			const j4 = j / 4
			const gi = g[0][Math.floor(i4)] + (i4 - Math.floor(i4)) * (g[0][Math.ceil(i4)] - g[0][Math.floor(i4)])
			const gj = g[1][Math.floor(j4)] + (j4 - Math.floor(j4)) * (g[1][Math.ceil(j4)] - g[1][Math.floor(j4)])
			x0.push([gi, gj])
		}
	}
	const y0 = model.predict(x0)
	for (let i = 0, p = 0; i <= (n - 1) * 4; i++) {
		for (let j = 0; j <= (n - 1) * 4; j++, p++) {
			if (i / 4 < 1 || i / 4 > n - 2 || j / 4 < 1 || j / 4 > n - 2) {
				expect(y0[p]).toBeNull()
			} else if (Number.isInteger(i / 4) && Number.isInteger(j / 4)) {
				expect(y0[p]).toBeCloseTo(v[i / 4][j / 4])
			} else if (Number.isInteger(i / 4)) {
				const ps = [v[i / 4][Math.ceil(j / 4)], v[i / 4][Math.floor(j / 4)]]
				const l = Math.min(...ps)
				const h = Math.max(...ps)
				expect(y0[p]).toBeGreaterThanOrEqual(l - (h - l) / 1.5)
				expect(y0[p]).toBeLessThanOrEqual(h + (h - l) / 1.5)
			} else if (Number.isInteger(j / 4)) {
				const ps = [v[Math.ceil(i / 4)][j / 4], v[Math.floor(i / 4)][j / 4]]
				const l = Math.min(...ps)
				const h = Math.max(...ps)
				expect(y0[p]).toBeGreaterThanOrEqual(l - (h - l) / 1.5)
				expect(y0[p]).toBeLessThanOrEqual(h + (h - l) / 1.5)
			} else {
				const ps = [
					v[Math.floor(i / 4)][Math.floor(j / 4)],
					v[Math.ceil(i / 4)][Math.floor(j / 4)],
					v[Math.floor(i / 4)][Math.ceil(j / 4)],
					v[Math.ceil(i / 4)][Math.ceil(j / 4)],
				]
				const l = Math.min(...ps)
				const h = Math.max(...ps)
				expect(y0[p]).toBeGreaterThanOrEqual(l - (h - l) / 1.5)
				expect(y0[p]).toBeLessThanOrEqual(h + (h - l) / 1.5)
			}
		}
	}

	const yout = model.predict([
		[g[0][0] - 0.1, g[1][0]],
		[g[0][0], g[1][0] - 0.1],
		[g[0][0] - 0.1, g[1][0] - 0.1],
		[g[0][g[0].length - 1] + 0.1, g[1][g[1].length - 1]],
		[g[0][g[0].length - 1], g[1][g[1].length - 1] + 0.1],
		[g[0][g[0].length - 1] + 0.1, g[1][g[1].length - 1] + 0.1],
	])
	for (let i = 0; i < yout.length; i++) {
		expect(yout[i]).toBeNull()
	}
})
