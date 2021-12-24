import DelaunayInterpolation from '../../../lib/model/delaunay_interpolation.js'

test('fit', () => {
	const model = new DelaunayInterpolation()
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
	expect(model.predict([[0, 0.5]])[0]).toBe(2)
	expect(model.predict([[0.5, 0]])[0]).toBe(2)
	expect(model.predict([[0.5, 0.5]])[0]).toBe(1.5)
	expect(model.predict([[0.5, 1]])[0]).toBe(2.5)
	expect(model.predict([[1, 0]])[0]).toBe(3)
	expect(model.predict([[1, 0.5]])[0]).toBe(2.5)
})
