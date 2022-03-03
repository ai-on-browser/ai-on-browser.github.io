import Matrix from '../../../lib/util/matrix.js'
import SplitAndMerge from '../../../lib/model/split_merge.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'

test.each(['variance', 'uniformity'])('predict %s', method => {
	const model = new SplitAndMerge(method)
	const n = 100
	const x = Matrix.zeros(n, n).toArray()
	const t = []
	for (let i = 0, p = 0; i < n; i++) {
		for (let j = 0; j < n; j++, p++) {
			if ((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2) {
				x[i][j] = 255
				t[p] = 1
			} else {
				t[p] = 0
			}
		}
	}

	const y = model.predict(x)
	const ri = randIndex(y.flat(), t)
	expect(ri).toBeGreaterThan(0.9)
})
