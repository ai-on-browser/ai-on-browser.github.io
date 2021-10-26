import OnlineGradientDescent from '../../../lib/model/ogd.js'

test('default', () => {
	const model = new OnlineGradientDescent()
	expect(model._c).toBe(1)
})

test.each([
	[1, 1, -1, -1],
	[1, -1, 1, -1],
	[-1, -1, 1, 1],
])('fit[%i, %i, %i, %i]', (a, b, c, d) => {
	const model = new OnlineGradientDescent()
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
