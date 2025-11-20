import Matrix from '../../../lib/util/matrix.js'
import GSOM from '../../../lib/model/growing_som.js'

test.each([undefined, 0.9])('clustering %j', sf => {
	const model = new GSOM(sf)
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	expect(model.size).toBeGreaterThan(2)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
})
