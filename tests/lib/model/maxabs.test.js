import Matrix from '../../../lib/util/matrix.js'
import MaxAbsScaler from '../../../lib/model/maxabs.js'

test('fit', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.randn(50, 2, 1, 0.2)
	const xabsmax = x.copyMap(Math.abs).max(0).value
	model.fit(x.toArray())
	const y = model.predict(x.toArray())

	const min = Array(2).fill(Infinity)
	const max = Array(2).fill(-Infinity)
	const absmax = Array(2).fill(0)
	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo(x.at(i, k) / xabsmax[k])
			min[k] = Math.min(min[k], y[i][k])
			max[k] = Math.max(max[k], y[i][k])
			absmax[k] = Math.max(max[k], Math.abs(y[i][k]))
		}
	}
	for (let k = 0; k < min.length; k++) {
		expect(min[k]).toBeGreaterThanOrEqual(-1)
	}
	for (let k = 0; k < max.length; k++) {
		expect(max[k]).toBeLessThanOrEqual(1)
	}
	for (let k = 0; k < absmax.length; k++) {
		expect(absmax[k]).toBeCloseTo(1)
	}
})
