import RecursiveLeastSquares from '../../../lib/model/rls.js'

test('default', () => {
	const model = new RecursiveLeastSquares()
})

test.each([
	[1, 1, -1, -1],
	[1, -1, 1, -1],
	[-1, -1, 1, 1],
])('fit[%i, %i, %i, %i]', (a, b, c, d) => {
	const model = new RecursiveLeastSquares()
	const x = [
		[1, 1],
		[1, 0],
		[0, 1],
		[0, 0],
	]
	const t = [[a], [b], [c], [d]]
	for (let i = 0; i < 1000; i++) {
		model.fit(x, t)
	}
	const y = model.predict(x)
	for (let i = 0; i < 4; i++) {
		expect(y[i]).toBeCloseTo(t[i][0])
	}
})
