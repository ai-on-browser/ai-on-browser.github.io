import PA from '../../../lib/model/passive_aggressive'

describe.each([0, 1, 2])('version %i', v => {
	test('default', () => {
		const model = new PA(v)
		expect(model._c).toBe(0.1)
	})

	test.each([
		[1, 1, -1, -1],
		[1, -1, 1, -1],
		[-1, -1, 1, 1],
	])('fit[%i, %i, %i, %i]', (a, b, c, d) => {
		const model = new PA(v)
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
			expect(y[i]).toBeCloseTo(t[i][0])
		}
	})
})
