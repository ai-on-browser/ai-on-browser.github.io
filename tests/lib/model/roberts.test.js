import Matrix from '../../../lib/util/matrix.js'
import RobertsCross from '../../../lib/model/roberts.js'

test('predict', () => {
	const model = new RobertsCross(128)
	const n = 100
	const x = Matrix.zeros(n, n).toArray()
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if ((i - n / 2) ** 2 + (j - n / 2) ** 2 < (n / 4) ** 2) {
				x[i][j] = 255
			}
		}
	}

	const y = model.predict(x)
	const b = [0, 0]
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			const r2 = (i - n / 2) ** 2 + (j - n / 2) ** 2
			if ((n / 4 - 1.5) ** 2 < r2 && r2 < (n / 4 + 1.5) ** 2) {
				if (y[i][j]) {
					b[0]++
				} else {
					b[1]++
				}
				continue
			}
			expect(y[i][j]).toBe(false)
		}
	}
	expect(b[0] / (b[0] + b[1])).toBeGreaterThan(0.4)
})
