import Matrix from '../../../lib/util/matrix.js'
import YeoJohnson from '../../../lib/model/yeo_johnson.js'

const yeojhonson = (x, l) => {
	if (x >= 0) {
		if (l === 0) {
			return Math.log(x + 1)
		} else {
			return ((x + 1) ** l - 1) / l
		}
	} else {
		if (l === 2) {
			return -Math.log(-x + 1)
		} else {
			return -((-x + 1) ** (2 - l) - 1) / (2 - l)
		}
	}
}

describe('fit', () => {
	test('mat mat', () => {
		const model = new YeoJohnson()
		const x = Matrix.randn(50, 2, 1, 0.2).toArray()
		model.fit(x)
		const lambda = model._lambda
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(yeojhonson(x[i][k], lambda[k]))
			}
		}
	})

	test('mat arr', () => {
		const model = new YeoJohnson()
		const x0 = Matrix.randn(50, 2, 1, 0.2).toArray()
		model.fit(x0)
		const lambda = model._lambda

		const x = Matrix.randn(50, 1, 1, 0.2).value
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(yeojhonson(x[i], lambda[0]))
		}
	})

	test('arr mat', () => {
		const model = new YeoJohnson()
		const x0 = Matrix.randn(50, 1, 1, 0.2).value
		model.fit(x0)
		const lambda = model._lambda

		const x = Matrix.randn(50, 2, 1, 0.2).toArray()
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(yeojhonson(x[i][k], lambda))
			}
		}
	})

	test('arr arr', () => {
		const model = new YeoJohnson()
		const x = Matrix.randn(50, 1, 1, 0.2).value
		model.fit(x)
		const lambda = model._lambda
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(yeojhonson(x[i], lambda))
		}
	})
})

describe('predict', () => {
	test.each([[[0, 1]]])('mat %p', lambda => {
		const model = new YeoJohnson(lambda)
		const x = Matrix.randn(50, 2, 1, 0.2).toArray()
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(yeojhonson(x[i][k], lambda[k]))
			}
		}
	})

	test.each([-1, 0, 1, 2])('mat %p', lambda => {
		const model = new YeoJohnson(lambda)
		const x = Matrix.randn(50, 2, 1, 0.2).toArray()
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < x[i].length; k++) {
				expect(y[i][k]).toBeCloseTo(yeojhonson(x[i][k], lambda))
			}
		}
	})

	test.each([[[0, 1]]])('arr %p', lambda => {
		const model = new YeoJohnson(lambda)
		const x = Matrix.randn(50, 1, 1, 0.2).value
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(yeojhonson(x[i], lambda[0]))
		}
	})

	test.each([-1, 0, 1, 2])('arr %p', lambda => {
		const model = new YeoJohnson(lambda)
		const x = Matrix.randn(50, 1, 1, 0.2).value
		const y = model.predict(x)

		for (let i = 0; i < x.length; i++) {
			expect(y[i]).toBeCloseTo(yeojhonson(x[i], lambda))
		}
	})
})
