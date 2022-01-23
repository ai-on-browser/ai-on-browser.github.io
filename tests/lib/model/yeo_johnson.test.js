import Matrix from '../../../lib/util/matrix.js'
import YeoJohnson from '../../../lib/model/yeo_johnson.js'

test.each([undefined, [0, 2], [1, 3]])('fit %p', lambda => {
	const model = new YeoJohnson(lambda)
	const x = Matrix.randn(50, 2, 1, 0.2).toArray()
	if (lambda === undefined) {
		model.fit(x)
	}
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			if (x[i][k] >= 0) {
				if (model._lambda[k] === 0) {
					expect(y[i][k]).toBeCloseTo(Math.log(x[i][k] + 1))
				} else {
					expect(y[i][k]).toBeCloseTo(((x[i][k] + 1) ** model._lambda[k] - 1) / model._lambda[k])
				}
			} else {
				if (model._lambda[k] === 2) {
					expect(y[i][k]).toBeCloseTo(-Math.log(-x[i][k] + 1))
				} else {
					expect(y[i][k]).toBeCloseTo(
						-((-x[i][k] + 1) ** (2 - model._lambda[k]) - 1) / (2 - model._lambda[k])
					)
				}
			}
		}
	}
})

test.each([-1, 0, 1, 2, 3])('fit %p', lambda => {
	const model = new YeoJohnson(lambda)
	const x = Matrix.randn(50, 2, 1, 0.2).toArray()
	const y = model.predict(x)

	for (let i = 0; i < x.rows; i++) {
		for (let k = 0; k < x.cols; k++) {
			if (x[i][k] >= 0) {
				if (model._lambda === 0) {
					expect(y[i][k]).toBeCloseTo(Math.log(x[i][k] + 1))
				} else {
					expect(y[i][k]).toBeCloseTo(((x[i][k] + 1) ** model._lambda - 1) / model._lambda)
				}
			} else {
				if (model._lambda === 2) {
					expect(y[i][k]).toBeCloseTo(-Math.log(-x[i][k] + 1))
				} else {
					expect(y[i][k]).toBeCloseTo(-((-x[i][k] + 1) ** (2 - model._lambda) - 1) / (2 - model._lambda))
				}
			}
		}
	}
})
