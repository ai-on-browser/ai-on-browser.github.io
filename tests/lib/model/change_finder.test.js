import Matrix from '../../../lib/util/matrix.js'
import ChangeFinder from '../../../lib/model/change_finder.js'

describe('anomaly detection', () => {
	test('default', () => {
		const model = new ChangeFinder()
		const n = 50
		const x = Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 10, 11)).value
		model.fit(x)
		const p = model.predict()
		expect(p).toHaveLength(100)
	})

	test('with params', () => {
		const model = new ChangeFinder(5)
		const n = 50
		const x = Matrix.concat(Matrix.random(n, 1, 0, 1), Matrix.random(n, 1, 10, 11)).value
		model.fit(x)
		const p = model.predict()
		expect(p).toHaveLength(100)
	})
})
