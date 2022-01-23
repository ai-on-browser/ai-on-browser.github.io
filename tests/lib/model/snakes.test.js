import Tensor from '../../../lib/util/tensor.js'
import Snakes from '../../../lib/model/snakes.js'

test('predict', () => {
	const model = new Snakes(1, 1, 1, 12)
	const n = 100
	const x = Tensor.zeros([n, n, 1]).toArray()
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if ((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2) {
				x[i][j][0] = 255
			}
		}
	}

	model.init(x)
	for (let i = 0; i < 100; i++) {
		model.fit()
	}

	const y = model.predict(x)
	const b = [0, 0]
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			const r2 = (i - n / 2) ** 2 + (j - n / 2) ** 2
			if ((n / 4 - 2) ** 2 < r2 && r2 < (n / 4 + 2) ** 2) {
				if (y[i][j]) {
					b[0]++
				} else {
					b[1]++
				}
			} else {
				expect(y[i][j]).toBe(false)
			}
		}
	}
	expect(b[0] / (b[0] + b[1])).toBeGreaterThan(0.2)
})
