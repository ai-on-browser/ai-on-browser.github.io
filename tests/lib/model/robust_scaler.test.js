import { Matrix } from '../../../lib/util/math.js'
import RobustScaler from '../../../lib/model/robust_scaler.js'

test('fit', () => {
	const model = new RobustScaler()
	const x = Matrix.randn(101, 2, 1, 0.2).toArray()
	model.fit(x)
	const y = model.predict(x)

	const q = (arr, p) => {
		const np = (arr.length - 1) * p
		const np_l = Math.floor(np)
		const np_h = Math.ceil(np)
		return arr[np_l] + (np - np_l) * (arr[np_h] - arr[np_l])
	}

	for (let k = 0; k < 2; k++) {
		const yk = y.map(v => v[k])
		yk.sort()
		expect(q(yk, 0.5)).toBeCloseTo(0)
	}
})
