import Matrix from '../../../lib/util/matrix.js'
import YeoJohnson from '../../../lib/model/yeo_johnson.js'

const yeojhonson = (x, l) => {
	if (x >= 0) {
		if (l === 0) {
			return Math.log(x)
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

test.each([undefined, [0, 2], [1, 3]])('fit %p', lambda => {
	const model = new YeoJohnson(lambda)
	const x = Matrix.randn(50, 2, 1, 0.2).toArray()
	if (lambda === undefined) {
		model.fit(x)
		lambda = model._lambda
	}
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo(yeojhonson(x[i][k], lambda[k]))
		}
	}
})

test.each([-1, 0, 1, 2, 3])('fit %p', lambda => {
	const model = new YeoJohnson(lambda)
	const x = Matrix.randn(50, 2, 1, 0.2).toArray()
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo(yeojhonson(x[i][k], lambda))
		}
	}
})
