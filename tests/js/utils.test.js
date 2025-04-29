import { specialCategory, getCategoryColor, EventEmitter } from '../../js/utils'

describe('rgb', () => {
	test('toString', () => {
		const color = getCategoryColor(0)
		expect(color.toString()).toBe('rgb(0, 0, 0)')
	})
})

describe('specialCategory', () => {
	test('error', () => {
		const errorCategory = specialCategory.error
		expect(errorCategory).toBe(-2)

		const color = getCategoryColor(errorCategory)
		expect(color.r).toBe(255)
		expect(color.g).toBe(0)
		expect(color.b).toBe(0)
	})

	test.each([0, 0.1, 0.2, 0.5, 0.9, 1])('errorRate %d', r => {
		const errorCategory = specialCategory.errorRate(r)
		expect(errorCategory).toBe(-1 - r)

		const color = getCategoryColor(errorCategory)
		expect(color.r).toBe(255)
		expect(color.g).toBeCloseTo((1 - r) * 255, -0.1)
		expect(color.b).toBeCloseTo((1 - r) * 255, -0.1)
	})

	test('dummy', () => {
		const errorCategory = specialCategory.dummy
		expect(errorCategory).toBe(-2)

		const color = getCategoryColor(errorCategory)
		expect(color.r).toBe(255)
		expect(color.g).toBe(0)
		expect(color.b).toBe(0)
	})

	test.each([0, 0.1, 0.2, 0.5, 0.9, 1])('density %d', r => {
		const errorCategory = specialCategory.density(r)
		expect(errorCategory).toBe(-1 + r)

		const color = getCategoryColor(errorCategory)
		expect(color.r).toBeCloseTo((1 - r) * 255, -0.1)
		expect(color.g).toBeCloseTo((1 - r) * 255, -0.1)
		expect(color.b).toBeCloseTo((1 - r) * 255, -0.1)
	})
})

describe('getCategoryColor', () => {
	test('0', () => {
		const color = getCategoryColor(0)
		expect(color.r).toBe(0)
		expect(color.g).toBe(0)
		expect(color.b).toBe(0)
	})

	test('1', () => {
		const color = getCategoryColor(1)
		expect(color.r).toBeGreaterThanOrEqual(0)
		expect(color.g).toBeGreaterThanOrEqual(0)
		expect(color.b).toBeGreaterThanOrEqual(0)
		expect(color.r).toBeLessThanOrEqual(255)
		expect(color.g).toBeLessThanOrEqual(255)
		expect(color.b).toBeLessThanOrEqual(255)

		const color2 = getCategoryColor(1)
		expect(color2.r).toBe(color.r)
		expect(color2.g).toBe(color.g)
		expect(color2.b).toBe(color.b)
	})

	test('2', () => {
		const color = getCategoryColor(1)
		const color2 = getCategoryColor(2)
		expect(color2.r).not.toBe(color.r)
		expect(color2.g).not.toBe(color.g)
		expect(color2.b).not.toBe(color.b)
	})

	test('1000', () => {
		const color = getCategoryColor(0)
		expect(color.r).toBe(0)
		expect(color.g).toBe(0)
		expect(color.b).toBe(0)
	})

	test('NaN', () => {
		const color = getCategoryColor('a')
		expect(color.r).toBe(0)
		expect(color.g).toBe(0)
		expect(color.b).toBe(0)
	})
})

describe('EventEmitter', () => {
	test('emit on', () => {
		const emitter = new EventEmitter()
		const c = []
		emitter.on('test', () => c.push(0))

		emitter.emit('test')
		emitter.emit('test')
		expect(c).toHaveLength(2)
	})

	test('emit set twice', () => {
		const emitter = new EventEmitter()
		const c = []
		emitter.on('test', () => c.push(0))
		emitter.once('test', () => c.push(1))

		emitter.emit('test')
		emitter.emit('test')
		expect(c).toHaveLength(3)
		expect(c.reduce((s, v) => s + v, 0)).toBe(1)
	})

	test('emit once', () => {
		const emitter = new EventEmitter()
		const c = []
		emitter.once('test', () => c.push(0))

		emitter.emit('test')
		emitter.emit('test')
		expect(c).toHaveLength(1)
	})

	test('emit no listener', () => {
		const emitter = new EventEmitter()
		emitter.emit('test')
		expect.assertions(0)
	})

	test('emit off no listener', () => {
		const emitter = new EventEmitter()
		emitter.off('test')
		expect.assertions(0)
	})

	test('emit off', () => {
		const emitter = new EventEmitter()
		const c = []
		const cb1 = () => c.push(0)
		const cb2 = () => c.push(1)
		emitter.on('test', cb1)
		emitter.on('test', cb2)
		emitter.emit('test')
		emitter.off('test', cb2)
		emitter.emit('test')
		expect(c).toHaveLength(3)
		expect(c.reduce((s, v) => s + v, 0)).toBe(1)
	})
})
