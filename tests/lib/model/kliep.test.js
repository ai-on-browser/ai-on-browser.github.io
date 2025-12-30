import KLIEP from '../../../lib/model/kliep.js'
import Matrix from '../../../lib/util/matrix.js'

test('kliep', { retry: 5, timeout: 30000 }, () => {
	const sigmas = []
	for (let i = -3; i <= 3; i += 0.5) {
		sigmas.push(10 ** i)
	}
	const model = new KLIEP(sigmas, 5, 50)

	const x1 = Matrix.randn(300, 1, 0).toArray()
	const x2 = Matrix.randn(200, 1, 0).toArray()
	model.fit(x1, x2)

	const r = model.predict(x2)
	for (let i = 0; i < x2.length; i++) {
		expect(r[i]).toBeCloseTo(1, 0)
	}
})

test('kliep single sigma', { retry: 5 }, () => {
	const model = new KLIEP([3], 5, 50)

	const x1 = Matrix.randn(300, 1, 0).toArray()
	const x2 = Matrix.randn(200, 1, 0).toArray()
	model.fit(x1, x2)

	const r = model.predict(x2)
	for (let i = 0; i < x2.length; i++) {
		expect(r[i]).toBeCloseTo(1, 0)
	}
})
