import { rmse } from '../../../lib/evaluate/regression.js'
import RamerDouglasPeucker from '../../../lib/model/ramer_douglas_peucker.js'
import Matrix from '../../../lib/util/matrix.js'

describe('fit', () => {
	test('default', () => {
		const model = new RamerDouglasPeucker()
		const x = Matrix.random(50, 1, 0, 5).value
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.sin(x[i]) + (Math.random() - 0.5) / 10
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})

	test('1', () => {
		const model = new RamerDouglasPeucker(1)
		const x = Matrix.random(50, 1, 0, 5).value
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = x[i] + (Math.random() - 0.5) / 10
		}
		model.fit(x, t)
		const y = model.predict(x)
		const err = rmse(y, t)
		expect(err).toBeLessThan(0.5)
	})
})
