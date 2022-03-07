import Matrix from '../../../lib/util/matrix.js'
import RobustScaler from '../../../lib/model/robust_scaler.js'

test('mat mat', () => {
	const model = new RobustScaler()
	const x = Matrix.randn(101, 2, 1, 0.2)
	const median = x.median(0).value
	const iqr = Matrix.sub(x.quantile(0.75, 0), x.quantile(0.25, 0)).value
	model.fit(x.toArray())

	const x1 = Matrix.randn(50, 2, 0, 0.2)
	const y = model.predict(x1.toArray())
	for (let i = 0; i < x1.rows; i++) {
		for (let k = 0; k < x1.cols; k++) {
			expect(y[i][k]).toBeCloseTo((x1.at(i, k) - median[k]) / iqr[k])
		}
	}
})

test('mat arr', () => {
	const model = new RobustScaler()
	const x = Matrix.randn(101, 2, 1, 0.2)
	const median = x.median(0).value
	const iqr = Matrix.sub(x.quantile(0.75, 0), x.quantile(0.25, 0)).value
	model.fit(x.toArray())

	const x1 = Matrix.randn(50, 1, 0, 0.2)
	const y = model.predict(x1.value)
	for (let i = 0; i < x1.rows; i++) {
		expect(y[i]).toBeCloseTo((x1.at(i, 0) - median[0]) / iqr[0])
	}
})

test('arr mat', () => {
	const model = new RobustScaler()
	const x = Matrix.randn(101, 1, 1, 0.2)
	const median = x.median()
	const iqr = x.quantile(0.75) - x.quantile(0.25)
	model.fit(x.value)

	const x1 = Matrix.randn(50, 2, 0, 0.2)
	const y = model.predict(x1.toArray())
	for (let i = 0; i < x1.rows; i++) {
		for (let k = 0; k < x1.cols; k++) {
			expect(y[i][k]).toBeCloseTo((x1.at(i, k) - median) / iqr)
		}
	}
})

test('arr arr', () => {
	const model = new RobustScaler()
	const x = Matrix.randn(101, 1, 1, 0.2)
	const median = x.median()
	const iqr = x.quantile(0.75) - x.quantile(0.25)
	model.fit(x.value)

	const x1 = Matrix.randn(50, 1, 0, 0.2)
	const y = model.predict(x1.value)
	for (let i = 0; i < x1.rows; i++) {
		expect(y[i]).toBeCloseTo((x1.at(i, 0) - median) / iqr)
	}
})
