import Matrix from '../../../lib/util/matrix.js'
import { uLSIF } from '../../../lib/model/ulsif.js'

describe('uLSIF dimension reduction', () => {
	test('many candidates', { retry: 3, timeout: 30000 }, () => {
		const sigmas = []
		const lambdas = []
		for (let i = -3; i <= 3; i += 0.5) {
			sigmas.push(10 ** i)
			lambdas.push(10 ** i)
		}
		const model = new uLSIF(sigmas, lambdas, 50)

		const x1 = Matrix.randn(300, 1, 0).toArray()
		const x2 = Matrix.randn(200, 1, 0).toArray()
		model.fit(x1, x2)

		const r = model.predict(x2)
		for (let i = 0; i < x2.length; i++) {
			expect(r[i]).toBeCloseTo(1, 0)
		}
	})

	test('single candidates', () => {
		const sigmas = [100]
		const lambdas = [0.01]
		const model = new uLSIF(sigmas, lambdas, 50)

		const x1 = Matrix.randn(300, 1, 0).toArray()
		const x2 = Matrix.randn(200, 1, 0).toArray()
		model.fit(x1, x2)

		const r = model.predict(x2)
		for (let i = 0; i < x2.length; i++) {
			expect(r[i]).toBeCloseTo(1, 0)
		}
	})
})
