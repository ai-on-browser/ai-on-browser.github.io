import Matrix from '../../../lib/util/matrix.js'
import LOESS from '../../../lib/model/loess.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', { retry: 3 }, () => {
	const model = new LOESS()
	const x = Matrix.random(50, 2, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 20]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
