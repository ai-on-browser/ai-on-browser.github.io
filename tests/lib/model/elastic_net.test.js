import { Matrix } from '../../../lib/util/math.js'
import ElasticNet from '../../../lib/model/elastic_net.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test('default', () => {
	const model = new ElasticNet(0.1)
	expect(model._lambda).toBe(0.1)
})

test.each([undefined, 'CD', 'ISTA'])('fit %s', method => {
	const model = new ElasticNet(0.01, 0.5, method)
	const x = Matrix.randn(50, 2, 0, 5).toArray()
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
