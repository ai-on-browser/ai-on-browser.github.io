import Matrix from '../../../lib/util/matrix.js'
import TietjenMoore from '../../../lib/model/tietjen_moore.js'

test.each([1, 2, 3])('anomaly detection %d', k => {
	const model = new TietjenMoore(k, 0.1)
	const x = Matrix.random(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const y = model.predict(x)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (c < k - 1) {
			if (y[i]) {
				c++
			}
			continue
		}
		expect(y[i]).toBe(false)
	}
	expect(c).toBe(k - 1)
	expect(y[y.length - 1]).toBe(true)
})

test('no outlier', () => {
	const model = new TietjenMoore(1, 0.1)
	const x = []
	for (let i = 0; i < 100; i++) {
		for (let j = 0; j < 100; j++) {
			x.push([i / 100, j / 100])
		}
	}
	const y = model.predict(x)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBe(false)
	}
})
