import { randIndex } from '../../../lib/evaluate/clustering.js'
import SplitAndMerge from '../../../lib/model/split_merge.js'

describe.each([undefined, 'variance', 'uniformity'])('predict %s', { timeout: 10000 }, method => {
	test('2d', () => {
		const model = new SplitAndMerge(method)
		const n = 100
		const x = []
		const t = []
		for (let i = 0, p = 0; i < n; i++) {
			x[i] = []
			for (let j = 0; j < n; j++, p++) {
				if ((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2) {
					x[i][j] = 255
					t[p] = 1
				} else {
					x[i][j] = 0
					t[p] = 0
				}
			}
		}

		const y = model.predict(x)
		const ri = randIndex(y.flat(), t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('3d', () => {
		const model = new SplitAndMerge(method)
		const n = 50
		const x = []
		const t = []
		for (let i = 0, p = 0; i < n; i++) {
			x[i] = []
			for (let j = 0; j < n; j++, p++) {
				if ((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2) {
					x[i][j] = [255, 255, 0]
					t[p] = 1
				} else {
					x[i][j] = [0, 0, 0]
					t[p] = 0
				}
			}
		}

		const y = model.predict(x)
		const ri = randIndex(y.flat(), t)
		expect(ri).toBeGreaterThan(0.9)
	})
})
