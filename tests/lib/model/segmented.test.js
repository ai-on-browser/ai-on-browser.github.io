import Matrix from '../../../lib/util/matrix.js'
import SegmentedRegression from '../../../lib/model/segmented.js'

import { rmse } from '../../../lib/evaluate/regression.js'

test.each([undefined, 3])('fit seg: %p', seg => {
	const model = new SegmentedRegression(seg)
	const x = Matrix.randn(50, 1, 0, 5).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + (Math.random() - 0.5) / 10]
	}
	model.fit(x, t)
	const y = model.predict(x)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(0.5)
})
