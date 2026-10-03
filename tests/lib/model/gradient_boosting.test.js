import { rmse } from '../../../lib/evaluate/regression.js'
import GradientBoosting from '../../../lib/model/gradient_boosting.js'
import Matrix from '../../../lib/util/matrix.js'

class LeastSquares {
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		this._shift = x.mean(0)
		x.sub(this._shift)

		this._w = x.tDot(x).solve(x.tDot(y))
		y.sub(x.dot(this._w))
		this._b = y.mean(0)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		x.sub(this._shift)
		const p = x.dot(this._w)
		p.add(this._b)
		return p.toArray()
	}
}

describe('regression', () => {
	test.each([undefined, 0.1])('default %s', lr => {
		const model = new GradientBoosting(() => new LeastSquares(), lr)
		const x = Matrix.random(20, 10, -2, 2).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit()
		}
		expect(model.size).toBe(20)
		const y = model.predict(x)
		const err = rmse(y, t)[0]
		expect(err).toBeLessThan(0.5)
	})
})
