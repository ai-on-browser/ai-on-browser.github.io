import HBOS from '../../../lib/model/hbos.js'
import Matrix from '../../../lib/util/matrix.js'

describe('anomaly detection', () => {
	test('static', { retry: 3 }, () => {
		const model = new HBOS(1.0, 'static')
		const x = Matrix.randn(100, 2, 0, 0.2).toArray()
		x.push([10, 10])
		const threshold = -5
		const y = model.predict(x).map(v => v < threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})

	test('dynamic', () => {
		const model = new HBOS(5)
		const x = [
			[-0.11, -0.6],
			[-0.16, -0.33],
			[-1.12, -0.4],
			[-0.14, -0.05],
			[0.05, 0.65],
			[0.07, -0.02],
			[-0.09, -0.64],
			[-0.34, -0.56],
			[-0.69, 0.63],
			[0.09, 0.03],
			[0.4, -0.3],
			[-0.37, -0.24],
			[-0.62, 0.2],
			[-0.45, -0.02],
			[-0.22, -0.49],
			[0.43, -0.04],
			[-0.83, 0.33],
			[-0.22, 0.52],
			[-0.42, -0.55],
			[-0, -0.32],
			[10, 10],
		]
		const threshold = -9
		const y = model.predict(x).map(v => v < threshold)
		for (let i = 0; i < y.length - 1; i++) {
			expect(y[i]).toBe(false)
		}
		expect(y[y.length - 1]).toBe(true)
	})
})
