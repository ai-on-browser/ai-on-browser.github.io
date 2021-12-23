import Hopfield from '../../../lib/model/hopfield.js'

test('reconstruct', () => {
	const model = new Hopfield()
	for (let i = 0; i < 10; i++) {
		model.fit([
			[1, 1, 1, -1, -1, -1],
			[-1, -1, -1, 1, 1, 1],
		])
	}
	const y1 = model.predict([1, -1, 1, -1, -1, -1])
	expect(y1).toEqual([1, 1, 1, -1, -1, -1])
	const y2 = model.predict([-1, 1, -1, 1, 1, 1])
	expect(y2).toEqual([-1, -1, -1, 1, 1, 1])
})
