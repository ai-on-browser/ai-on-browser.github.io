import Matrix from '../../../lib/util/matrix.js'
import RobustScaler from '../../../lib/model/robust_scaler.js'

test('fit', () => {
	const model = new RobustScaler()
	const x = Matrix.randn(101, 2, 1, 0.2)
	const median = x.median(0).value
	const iqr = Matrix.sub(x.quantile(0.75, 0), x.quantile(0.25, 0)).value
	model.fit(x.toArray())
	const y = model.predict(x.toArray())
	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo((x.at(i, k) - median[k]) / iqr[k])
		}
	}

	const q = (arr, p) => {
		const np = (arr.length - 1) * p
		const np_l = Math.floor(np)
		const np_h = Math.ceil(np)
		return arr[np_l] + (np - np_l) * (arr[np_h] - arr[np_l])
	}

	for (let k = 0; k < 2; k++) {
		const yk = y.map(v => v[k])
		yk.sort((a, b) => a - b)
		expect(q(yk, 0.5)).toBeCloseTo(0)
	}
})
