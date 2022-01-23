import Tensor from '../../../lib/util/tensor.js'
import StatisticalRegionMerging from '../../../lib/model/statistical_region_merging.js'

test('predict', () => {
	const model = new StatisticalRegionMerging(0.5)
	const x = Tensor.random([100, 100, 3]).toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(100)
	expect(y[0]).toHaveLength(100)
	for (let i = 0; i < 100; i++) {
		for (let j = 0; j < 100; j++) {
			const yp = y[i][j]
			const xp = x[i][j]
			expect(Math.sqrt((yp[0] - xp[0]) ** 2 + (yp[1] - xp[1]) ** 2 + (yp[2] - yp[2]) ** 2)).toBeLessThan(1)
		}
	}
})
