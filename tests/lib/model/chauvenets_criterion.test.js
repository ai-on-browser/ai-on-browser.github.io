import ChauvenetsCriterion from '../../../lib/model/chauvenets_criterion.js'
import Matrix from '../../../lib/util/matrix.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new ChauvenetsCriterion()
		const x = Matrix.random(100, 1, 0, 0.2).value
		x.push(10)
		const y = model.predict(x)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})
})
