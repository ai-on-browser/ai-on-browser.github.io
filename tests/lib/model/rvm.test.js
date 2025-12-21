import { rmse } from '../../../lib/evaluate/regression.js'
import RVM from '../../../lib/model/rvm.js'
import Matrix from '../../../lib/util/matrix.js'

test('fit', () => {
	const model = new RVM()
	const x = Matrix.random(50, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	for (let i = 0; i < 100; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	const err = rmse(
		y,
		t.map(v => v[0])
	)
	expect(err).toBeLessThan(0.5)
})
