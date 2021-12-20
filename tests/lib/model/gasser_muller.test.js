import { Matrix } from '../../../lib/util/math.js'
import GasserMuller from '../../../lib/model/gasser_muller.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('fit', () => {
	const model = new GasserMuller(1)
	const x = Matrix.random(50, 1, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(
		y,
		t.map(v => v[0])
	)
	expect(err).toBeLessThan(0.5)
})
