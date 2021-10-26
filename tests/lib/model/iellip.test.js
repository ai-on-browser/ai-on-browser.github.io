import { CELLIP, IELLIP } from '../../../lib/model/iellip.js'

describe('CELLIP', () => {
	test('default', () => {
		const model = new CELLIP()
		expect(model._gamma).toBe(0.1)
		expect(model._a).toBe(0.5)
	})

	test.each([
		[1, 1, -1, -1],
		[1, -1, 1, -1],
		[-1, -1, 1, 1],
	])('fit[%i, %i, %i, %i]', (a, b, c, d) => {
		const model = new CELLIP()
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
})

describe('IELLIP', () => {
	test('default', () => {
		const model = new IELLIP()
		expect(model._b).toBe(0.9)
		expect(model._c).toBe(0.5)
	})

	test.each([
		[1, 1, -1, -1],
		[1, -1, 1, -1],
		[-1, -1, 1, 1],
	])('fit[%i, %i, %i, %i]', (a, b, c, d) => {
		const model = new IELLIP()
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
