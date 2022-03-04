import Matrix from '../../../lib/util/matrix.js'
import BoxCox from '../../../lib/model/box_cox.js'

const boxcox = (x, l) => {
	if (l === 0) {
		return Math.log(x)
	} else {
		return (x ** l - 1) / l
	}
}

test.each([undefined, [0, 1]])('fit %p', lambda => {
	const model = new BoxCox(lambda)
	const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
	if (lambda === undefined) {
		model.fit(x)
		lambda = model._lambda
	}
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo(boxcox(x[i][k], lambda[k]))
		}
	}
})

test.each([-1, 0, 1])('fit %p', lambda => {
	const model = new BoxCox(lambda)
	const x = Matrix.map(Matrix.randn(50, 2, 1, 0.2), Math.exp).toArray()
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			expect(y[i][k]).toBeCloseTo(boxcox(x[i][k], lambda))
		}
	}
})
