import EmptyRLEnvironment, { RLRealRange, RLIntRange } from '../../../lib/rl/base.js'

describe('RLRealRange', () => {
	describe.each([
		[0, 3],
		[-2, 2],
	])('equal [%i, %i]', (min, max) => {
		test.each([3, 7, 10])('toSpace %i', n => {
			const range = new RLRealRange(min, max)
			const space = range.toSpace(n)
			expect(space).toHaveLength(n + 1)
			expect(space[0]).toBe(min)
			expect(space[n]).toBe(max)

			const step = (max - min) / n
			for (let i = 0; i <= n; i++) {
				expect(space[i]).toBeCloseTo(i * step + min)
			}
		})

		test.each([3, 7, 10])('toArray %i', n => {
			const range = new RLRealRange(min, max)
			const arr = range.toArray(n)
			expect(arr).toHaveLength(n)

			const step = (max - min) / n
			for (let i = 0; i < n; i++) {
				expect(arr[i]).toBeCloseTo((i + 0.5) * step + min)
			}
		})

		test.each([3, 7, 10])('indexOf %i', n => {
			const range = new RLRealRange(min, max)
			const minidx = range.indexOf(min, n)
			expect(minidx).toBe(0)
			const maxidx = range.indexOf(max, n)
			expect(maxidx).toBe(n - 1)

			const step = (max - min) / 100
			const resstep = (max - min) / n
			for (let i = min; i <= max; i += step) {
				const idx = range.indexOf(i, n)
				expect(idx).toBe(Math.floor((i - min) / resstep))
			}
		})
	})
})

describe('RLIntRange', () => {
	describe.each([
		[0, 8],
		[-2, 2],
	])('equal [%i, %i]', (min, max) => {
		test('length', () => {
			const range = new RLIntRange(min, max)
			expect(range).toHaveLength(max - min + 1)
		})

		test.each([3, 7, 10])('toArray %i', n => {
			const range = new RLIntRange(min, max)
			const arr = range.toArray(n)
			expect(arr).toHaveLength(Math.min(n, max - min + 1))

			const step = (max - min) / (arr.length - 1)
			for (let i = 0; i < arr.length; i++) {
				expect(arr[i]).toBeCloseTo(min + Math.round(i * step))
			}
		})

		test.each([3, 7, 10])('indexOf %i', n => {
			const range = new RLIntRange(min, max)
			const minidx = range.indexOf(min, n)
			expect(minidx).toBe(0)
			const maxidx = range.indexOf(max, n)
			expect(maxidx).toBe(Math.min(n - 1, max - min))

			const resstep = (max - min) / Math.min(n, max - min)
			for (let i = min; i < max; i++) {
				const idx = range.indexOf(i, n)
				expect(idx).toBe(Math.floor((i - min) / resstep))
			}
		})
	})
})

describe('EmptyRLEnvironment', () => {
	test('constructor', () => {
		const env = new EmptyRLEnvironment()
		expect(env).toBeDefined()
	})

	test('actions', () => {
		const env = new EmptyRLEnvironment()
		expect(env.actions).toEqual([])
	})

	test('states', () => {
		const env = new EmptyRLEnvironment()
		expect(env.states).toEqual([])
	})

	test('reset', () => {
		const env = new EmptyRLEnvironment()
		const init_state = env.reset()
		expect(init_state).toHaveLength(0)
		expect(env.state()).toEqual(init_state)
	})

	describe('state', () => {
		test('init', () => {
			const env = new EmptyRLEnvironment()
			expect(env.state()).toHaveLength(0)
		})
	})

	test('step', () => {
		const env = new EmptyRLEnvironment()
		const info = env.step(env.sample_action())
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
		expect(info.state).toHaveLength(0)
	})

	test('function test', () => {
		const env = new EmptyRLEnvironment()
		const info = env.test([], [])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
		expect(info.state).toHaveLength(0)
	})
})
