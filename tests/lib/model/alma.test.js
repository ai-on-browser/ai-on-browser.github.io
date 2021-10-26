import ALMA from '../../../lib/model/alma.js'

test('default', () => {
	const model = new ALMA()
	expect(model._p).toBe(2)
	expect(model._alpha).toBe(1)
	expect(model._b).toBe(1)
	expect(model._c).toBe(1)
})

test.each([
	[1, 1, -1, -1],
	[1, -1, 1, -1],
	[-1, -1, 1, 1],
])('fit[%i, %i, %i, %i]', (a, b, c, d) => {
	const model = new ALMA()
	const x = [
		[1, 1],
		[1, 0],
		[0, 1],
		[0, 0],
	]
	const t = [[a], [b], [c], [d]]
	model.init(x, t)
	for (let i = 0; i < 1000; i++) {
		model.fit()
	}
	const y = model.predict(x)
	for (let i = 0; i < 4; i++) {
		expect(Math.sign(y[i])).toBeCloseTo(Math.sign(t[i][0]))
	}
})
