import Matrix from '../../../lib/util/matrix.js'
import RANSAC from '../../../lib/model/ransac.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('ransac', () => {
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
