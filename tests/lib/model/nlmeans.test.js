import Matrix from '../../../lib/util/matrix.js'
import NLMeans from '../../../lib/model/nlmeans.js'

test('predict', () => {
	const model = new NLMeans(4, 5)
	const n = 50
	const x = Matrix.zeros(n, n).toArray()
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if ((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2) {
				x[i][j] = [200 + Math.random() - 0.5]
			} else {
				x[i][j] = [10 + Math.random() - 0.5]
			}
		}
	}

	const y = model.predict(x)
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			expect(y[i][j][0]).toBeCloseTo((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2 ? 200 : 10, 0)
		}
	}
})
