import AkimaInterpolation from '../../../lib/model/akima.js'

test.each([undefined, true, false])('predict %p', modify => {
	const model = new AkimaInterpolation(modify)
	const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	const t = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5]

	model.fit(x, t)

	const x0 = []
	const scale = 100
	for (let i = -scale; i <= scale * 10; i++) {
		x0[i + scale] = i / scale
	}
	const y = model.predict(x0)

	expect(y).toHaveLength(x0.length)

	let d = 0
	for (let i = 0; i < y.length - 1; i++) {
		d += Math.abs(y[i] - y[i + 1])
	}
	expect(d / y.length).toBeLessThan(0.1)
	for (let i = 0; i < x.length; i++) {
		const idx = x0.indexOf(x[i])
		expect(y[idx]).toBeCloseTo(t[i])
	}
})
