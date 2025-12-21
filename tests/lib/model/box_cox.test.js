import BoxCox from '../../../lib/model/box_cox.js'
import Matrix from '../../../lib/util/matrix.js'

const boxcox = (x, l) => {
	if (l === 0) {
		return Math.log(x)
	} else {
		return (x ** l - 1) / l
	}
}

describe('fit', () => {
	test('mat mat', () => {
		const model = new BoxCox()
		const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		model.fit(x)
		const lambda = model._lambda
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(boxcox(x[i][k], lambda[k]))
			}
		}
	})

	test('mat arr', () => {
		const model = new BoxCox()
		const x0 = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		model.fit(x0)
		const lambda = model._lambda

		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(boxcox(x[i], lambda[0]))
		}
	})

	test('arr mat', () => {
		const model = new BoxCox()
		const x0 = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		model.fit(x0)
		const lambda = model._lambda

		const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(boxcox(x[i][k], lambda))
			}
		}
	})

	test('arr arr', () => {
		const model = new BoxCox()
		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		model.fit(x)
		const lambda = model._lambda
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(boxcox(x[i], lambda))
		}
	})
})

describe('predict', () => {
	test.each([[[0, 1]]])('mat %j', lambda => {
		const model = new BoxCox(lambda)
		const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(boxcox(x[i][k], lambda[k]))
			}
		}
	})

	test.each([-1, 0, 1])('mat %j', lambda => {
		const model = new BoxCox(lambda)
		const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(boxcox(x[i][k], lambda))
			}
		}
	})

	test.each([[[0, 1]]])('arr %j', lambda => {
		const model = new BoxCox(lambda)
		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(boxcox(x[i], lambda[0]))
		}
	})

	test.each([-1, 0, 1])('arr %j', lambda => {
		const model = new BoxCox(lambda)
		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(boxcox(x[i], lambda))
		}
	})
})

describe('inverse', () => {
	test('mat mat', () => {
		const model = new BoxCox()
		const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		model.fit(x)
		const y = model.predict(x)
		const x2 = model.inverse(y)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(x2[i][k]).toBeCloseTo(x[i][k])
			}
		}
	})

	test('mat arr', () => {
		const model = new BoxCox()
		const x0 = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		model.fit(x0)

		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		const y = model.predict(x)
		const x2 = model.inverse(y)

		for (let i = 0; i < x.length; i++) {
			expect(x2[i]).toBeCloseTo(x[i])
		}
	})

	test('arr mat', () => {
		const model = new BoxCox()
		const x0 = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		model.fit(x0)

		const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
		const y = model.predict(x)
		const x2 = model.inverse(y)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(x2[i][k]).toBeCloseTo(x[i][k])
			}
		}
	})

	test('arr arr', () => {
		const model = new BoxCox()
		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		model.fit(x)
		const y = model.predict(x)
		const x2 = model.inverse(y)

		for (let i = 0; i < x.length; i++) {
			expect(x2[i]).toBeCloseTo(x[i])
		}
	})

	test.each([-1, 0, 1])('arr %j', lambda => {
		const model = new BoxCox(lambda)
		const x = Matrix.map(Matrix.randn(50, 1, 1, 0.2), Math.exp).value
		const y = model.predict(x)
		const x2 = model.inverse(y)

		for (let i = 0; i < x.length; i++) {
			expect(x2[i]).toBeCloseTo(x[i])
		}
	})
})
