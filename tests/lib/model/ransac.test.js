import { rmse } from '../../../lib/evaluate/regression.js'
import RANSAC from '../../../lib/model/ransac.js'
import Matrix from '../../../lib/util/matrix.js'

describe('ransac', () => {
	test('predict 2d', () => {
		const model = new RANSAC(() => {
			let w, b
			return {
				fit: (x, y) => {
					x = Matrix.fromArray(x)
					y = Matrix.fromArray(y)
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		})
		const n = 100
		const x = Matrix.randn(n, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})

	test('predict 1d', () => {
		const model = new RANSAC(() => {
			let w, b
			return {
				fit: (x, y) => {
					x = Matrix.fromArray(x)
					y = new Matrix(y.length, 1, y)
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.value
				},
			}
		})
		const n = 100
		const x = Matrix.randn(n, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = x[i][0] + x[i][1] + (Math.random() - 0.5) / 10
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})

	test('predict score', () => {
		const model = new RANSAC(() => {
			let w, b
			return {
				fit: (x, y) => {
					x = Matrix.fromArray(x)
					y = Matrix.fromArray(y)
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
				score: (p, y) => {
					return p.reduce((s, v, i) => s + (v[0] - y[i][0]) ** 2, 0)
				},
			}
		})
		const n = 100
		const x = Matrix.randn(n, 2, 0, 5).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})
