import Matrix from '../../../lib/util/matrix.js'
import RANSAC from '../../../lib/model/ransac.js'

import { rmse } from '../../../lib/evaluate/regression.js'

describe('ransac', () => {
	test('predict 2d', () => {
		const model = new RANSAC(function () {
			this.fit = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
		const model = new RANSAC(function () {
			this.fit = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = new Matrix(y.length, 1, y)
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.value
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
		const model = new RANSAC(function () {
			this.fit = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
			}
			this.score = (p, y) => {
				return p.reduce((s, v, i) => s + (v[0] - y[i][0]) ** 2, 0)
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
