import Matrix from '../../../lib/util/matrix.js'
import MaxAbsScaler from '../../../lib/model/maxabs.js'

test('mat mat', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.randn(50, 2, 1, 0.2)
	const xabsmax = Matrix.map(x, Math.abs).max(0).value
	model.fit(x.toArray())

	const x1 = Matrix.randn(50, 2, 0, 0.2)
	const y = model.predict(x1.toArray())

	for (let i = 0; i < x1.rows; i++) {
		for (let j = 0; j < x1.cols; j++) {
			expect(y[i][j]).toBeCloseTo(x1.at(i, j) / xabsmax[j])
		}
	}
})

test('mat arr', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.randn(50, 2, 1, 0.2)
	const xabsmax = Matrix.map(x, Math.abs).max(0).value
	model.fit(x.toArray())

	const x1 = Matrix.randn(50, 1, 0, 0.2)
	const y = model.predict(x1.value)

	for (let i = 0; i < x1.rows; i++) {
		expect(y[i]).toBeCloseTo(x1.at(i, 0) / xabsmax[0])
	}
})

test('mat 0', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.zeros(50, 2)
	model.fit(x.toArray())

	const x1 = Matrix.randn(50, 2, 0, 0.2)
	const y = model.predict(x1.toArray())

	for (let i = 0; i < x1.rows; i++) {
		for (let j = 0; j < x1.cols; j++) {
			expect(y[i][j]).toBeCloseTo(x1.at(i, j))
		}
	}
})

test('arr mat', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.randn(50, 1, 1, 0.2)
	const xabsmax = Matrix.map(x, Math.abs).max()
	model.fit(x.value)

	const x1 = Matrix.randn(50, 2, 0, 0.2)
	const y = model.predict(x1.toArray())

	for (let i = 0; i < x1.rows; i++) {
		for (let j = 0; j < x1.cols; j++) {
			expect(y[i][j]).toBeCloseTo(x1.at(i, j) / xabsmax)
		}
	}
})

test('arr arr', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.randn(50, 1, 1, 0.2)
	const xabsmax = Matrix.map(x, Math.abs).max()
	model.fit(x.value)

	const x1 = Matrix.randn(50, 1, 0, 0.2)
	const y = model.predict(x1.value)

	for (let i = 0; i < x1.rows; i++) {
		expect(y[i]).toBeCloseTo(x1.at(i, 0) / xabsmax)
	}
})

test('arr 0', () => {
	const model = new MaxAbsScaler()
	const x = Matrix.zeros(50, 1, 1, 0.2)
	model.fit(x.value)

	const x1 = Matrix.randn(50, 1, 0, 0.2)
	const y = model.predict(x1.value)

	for (let i = 0; i < x1.rows; i++) {
		expect(y[i]).toBeCloseTo(x1.at(i, 0))
	}
})
