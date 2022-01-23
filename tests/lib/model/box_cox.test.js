import Matrix from '../../../lib/util/matrix.js'
import BoxCox from '../../../lib/model/box_cox.js'

test.each([undefined, [0, 1]])('fit %p', lambda => {
	const model = new BoxCox(lambda)
	const x = Matrix.randn(50, 2, 1, 0.2).copyMap(Math.exp).toArray()
	if (lambda === undefined) {
		model.fit(x)
	}
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			if (model._lambda[k] === 0) {
				expect(y[i][k]).toBeCloseTo(Math.log(x[i][k]))
			} else {
				expect(y[i][k]).toBeCloseTo((x[i][k] ** model._lambda[k] - 1) / model._lambda[k])
			}
		}
	}
})

test.each([-1, 0, 1])('fit %p', lambda => {
	const model = new BoxCox(lambda)
	const x = Matrix.randn(50, 2, 1, 0.2).copyMap(Math.exp).toArray()
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			if (model._lambda === 0) {
				expect(y[i][k]).toBeCloseTo(Math.log(x[i][k]))
			} else {
				expect(y[i][k]).toBeCloseTo((x[i][k] ** model._lambda - 1) / model._lambda)
			}
		}
	}
})
