import MinmaxNormalization from '../../../lib/model/minmax.js'
import Matrix from '../../../lib/util/matrix.js'

describe('predict', () => {
	test('mat mat', () => {
		const model = new MinmaxNormalization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())

		const xmin = x.min(0).value
		const xmax = x.max(0).value
		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(y[i][k]).toBeCloseTo((x1.at(i, k) - xmin[k]) / (xmax[k] - xmin[k]))
			}
		}
	})

	test('mat arr', () => {
		const model = new MinmaxNormalization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)

		const xmin = x.min(0).value
		const xmax = x.max(0).value
		for (let i = 0; i < x1.rows; i++) {
			expect(y[i]).toBeCloseTo((x1.at(i, 0) - xmin[0]) / (xmax[0] - xmin[0]))
		}
	})

	test('mat same', () => {
		const model = new MinmaxNormalization()
		const r = Math.random()
		const x = new Matrix(50, 2, r)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())

		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(y[i][k]).toBeCloseTo(x1.at(i, k) - r)
			}
		}
	})

	test('arr mat', () => {
		const model = new MinmaxNormalization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 2, 0, 0.2)
		const y = model.predict(x1.toArray())

		const xmin = x.min()
		const xmax = x.max()
		for (let i = 0; i < x1.rows; i++) {
			for (let k = 0; k < x1.cols; k++) {
				expect(y[i][k]).toBeCloseTo((x1.at(i, k) - xmin) / (xmax - xmin))
			}
		}
	})

	test('arr arr', () => {
		const model = new MinmaxNormalization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)

		const xmin = x.min()
		const xmax = x.max()
		for (let i = 0; i < x1.rows; i++) {
			expect(y[i]).toBeCloseTo((x1.at(i, 0) - xmin) / (xmax - xmin))
		}
	})

	test('arr same', () => {
		const model = new MinmaxNormalization()
		const r = Math.random()
		const x = new Matrix(50, 1, r)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)

		for (let i = 0; i < x1.rows; i++) {
			expect(y[i]).toBeCloseTo(x1.at(i, 0) - r)
		}
	})
})

describe('inverse', () => {
	test('mat mat', () => {
		const model = new MinmaxNormalization()
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
		const model = new MinmaxNormalization()
		const x = Matrix.randn(50, 2, 1, 0.2)
		model.fit(x.toArray())

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)
		const x2 = model.inverse(y)
		for (let i = 0; i < x1.rows; i++) {
			expect(x2[i]).toBeCloseTo(x1.at(i, 0))
		}
	})

	test('mat same', () => {
		const model = new MinmaxNormalization()
		const r = Math.random()
		const x = new Matrix(50, 2, r)
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

	test('arr mat', () => {
		const model = new MinmaxNormalization()
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
		const model = new MinmaxNormalization()
		const x = Matrix.randn(50, 1, 1, 0.2)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)
		const x2 = model.inverse(y)
		for (let i = 0; i < x1.rows; i++) {
			expect(x2[i]).toBeCloseTo(x1.at(i, 0))
		}
	})

	test('arr same', () => {
		const model = new MinmaxNormalization()
		const r = Math.random()
		const x = new Matrix(50, 1, r)
		model.fit(x.value)

		const x1 = Matrix.randn(50, 1, 0, 0.2)
		const y = model.predict(x1.value)
		const x2 = model.inverse(y)
		for (let i = 0; i < x1.rows; i++) {
			expect(x2[i]).toBeCloseTo(x1.at(i, 0))
		}
	})
})
