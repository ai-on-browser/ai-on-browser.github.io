import NaturalNeighborInterpolation from '../../../lib/model/natural_neighbor_interpolation.js'

test('fit', () => {
	const model = new NaturalNeighborInterpolation()
	const x = [
		[0, 0],
		[1, 1],
		[0, 1],
		[1, -1],
	]
	const t = [1, 2, 3, 4]
	model.fit(x, t)
	for (let i = 0; i < x.length; i++) {
		const p = model.predict([x[i]])
		expect(p[0]).toBe(t[i])
	}

	const test = []
	for (let i = 1; i < 9; i++) {
		test.push([i / 10, 0])
	}
	const p = model.predict(test)
	for (let i = 0; i < p.length; i++) {
		expect(p[i]).toBeGreaterThan(1)
		expect(p[i]).toBeLessThan(3)
	}
})
