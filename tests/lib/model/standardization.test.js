import Matrix from '../../../lib/util/matrix.js'
import Standardization from '../../../lib/model/standardization.js'

describe('predict', () => {
	test('mat mat', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())

		const mean = x.mean(0).value
		const std = x.std(0).value
		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(y[i][k]).toBeCloseTo((x1.at(i, k) - mean[k]) / std[k], 1)
			}
		}
	})

	test('mat arr', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)

		const mean = x.mean(0).value
		const std = x.std(0).value
		for (let i = 0; i < x1.rows; i++) {
			expect(y[i]).toBeCloseTo((x1.at(i, 0) - mean[0]) / std[0], 1)
		}
	})

	test('arr mat', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())

		const mean = x.mean()
		const std = x.std()
		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(y[i][k]).toBeCloseTo((x1.at(i, k) - mean) / std, 1)
			}
		}
	})

	test('arr arr', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)

		const mean = x.mean()
		const std = x.std()
		for (let i = 0; i < x1.rows; i++) {
			expect(y[i]).toBeCloseTo((x1.at(i, 0) - mean) / std, 1)
		}
	})
})

describe('inverse', () => {
	test('mat mat', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())
		const x2 = model.inverse(y)

		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(x2[i][k]).toBeCloseTo(x1.at(i, k))
			}
		}
	})

	test('mat arr', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)
		const x2 = model.inverse(y)

		for (let i = 0; i < x1.rows; i++) {
			expect(x2[i]).toBeCloseTo(x1.at(i, 0))
		}
	})

	test('arr mat', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())
		const x2 = model.inverse(y)

		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(x2[i][k]).toBeCloseTo(x1.at(i, k))
			}
		}
	})

	test('arr arr', () => {
		const model = new Standardization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)
		const x2 = model.inverse(y)

		for (let i = 0; i < x1.rows; i++) {
			expect(x2[i]).toBeCloseTo(x1.at(i, 0))
		}
	})
})
