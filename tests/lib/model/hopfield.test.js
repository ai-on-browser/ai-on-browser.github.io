import Hopfield from '../../../lib/model/hopfield.js'

test('reconstruct', () => {
	const model = new Hopfield()
	const x1 = [1, 1, 1, -1, -1, -1]
	const x2 = [-1, -1, -1, 1, 1, 1]
	model.fit([x1, x2])
	const oldenergy = model.energy(x1)
	for (let i = 0; i < 10; i++) {
		model.fit([x1, x2])
	}
	const newenergy = model.energy(x1)
	expect(newenergy).toBeLessThanOrEqual(oldenergy)
	const y1 = model.predict([1, -1, 1, -1, -1, -1])
	expect(y1).toEqual(x1)
	const y2 = model.predict([-1, 1, -1, 1, 1, 1])
	expect(y2).toEqual(x2)
})

test('reconstruct one', () => {
	const model = new Hopfield()
	const x = [1]
	model.fit([x])
	const energy = model.energy(x)
	expect(energy).toBe(0)
	const y = model.predict(x)
	expect(y).toEqual([1])
})
