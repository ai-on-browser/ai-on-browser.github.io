import BreakerRLEnvironment from '../../../lib/rl/breaker.js'

test('constructor', () => {
	const env = new BreakerRLEnvironment()
	expect(env).toBeDefined()
})

test('actions', () => {
	const env = new BreakerRLEnvironment()
	expect(env.actions).toEqual([[-1, 0, 1]])
})

test('states', () => {
	const env = new BreakerRLEnvironment()
	expect(env.states).toHaveLength(85)
	for (let i = 6; i < env.states.length; i++) {
		expect(env.states[i]).toEqual([0, 1])
	}
})

test('reset', () => {
	const env = new BreakerRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toHaveLength(85)
	expect(init_state[0]).toBeGreaterThanOrEqual(0)
	expect(init_state[1]).toBeGreaterThanOrEqual(0)
	expect(init_state[2]).toBeGreaterThanOrEqual(-3)
	expect(init_state[2]).toBeLessThanOrEqual(3)
	expect(init_state[3]).toBeGreaterThanOrEqual(-3)
	expect(init_state[3]).toBeLessThanOrEqual(3)
	expect(init_state[4]).toBeGreaterThanOrEqual(0)
	for (let i = 6; i < init_state.length; i++) {
		expect(init_state[i]).toBe(1)
	}
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const env = new BreakerRLEnvironment()
		env.reset()
		expect(env.state()).toHaveLength(85)
	})
})

test('step', () => {
	const env = new BreakerRLEnvironment()
	env.reset()
	expect(env.epoch).toBe(0)
	const info = env.step(env.sample_action())
	expect(env.epoch).toBe(1)
	expect(info.done).toBeFalsy()
	expect(info.reward).toBe(0.1)
	expect(info.state).toHaveLength(85)
})

describe('test', () => {
	test('default', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(env.epoch).toBe(0)
	})

	test('bar position: under', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[4] = 0

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(info.state[4]).toBe(env._paddle_size[0] / 2)
		expect(env.epoch).toBe(0)
	})

	test('bar position: over', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[4] = 1000

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(info.state[4]).toBe(env._size[0] - env._paddle_size[0] / 2)
		expect(env.epoch).toBe(0)
	})

	test('hit paddle top', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 100
		state[1] = env._paddle_baseline + 1
		state[2] = 1
		state[3] = -1
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(100)
		expect(info.state).toHaveLength(85)
		expect(env.epoch).toBe(0)
	})

	test.each([
		[1, -1],
		[-1, 1],
	])('hit paddle side: %p', (dx, dy) => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 100 - env._paddle_size[0] / 2
		state[1] = env._paddle_baseline
		state[2] = dx
		state[3] = dy
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(100)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0] + dx)
		expect(info.state[1]).toBe(state[1] + dy)
		expect(info.state[2]).toBe(-dx)
		expect(info.state[3]).toBe(dy)
		expect(info.state[4]).toBe(100)
		expect(env.epoch).toBe(0)
	})

	test('hit paddle side top (no contact)', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 100 - env._paddle_size[0] / 2
		state[1] = env._paddle_baseline + env._paddle_size[1] / 2
		state[2] = -env._ball_radius / Math.SQRT2
		state[3] = env._ball_radius / Math.SQRT2
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(env.epoch).toBe(0)
	})

	test('hit paddle side top (contact)', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 100 - env._paddle_size[0] / 2
		state[1] = env._paddle_baseline + env._paddle_size[1] / 2
		state[2] = -env._ball_radius / 2
		state[3] = env._ball_radius / 2
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(100)
		expect(info.state).toHaveLength(85)
		expect(env.epoch).toBe(0)
	})

	test('hit side left', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 0
		state[1] = 100
		state[2] = -1
		state[3] = 1
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0] - 1)
		expect(info.state[1]).toBe(state[1] + 1)
		expect(info.state[2]).toBe(1)
		expect(info.state[3]).toBe(1)
		expect(info.state[4]).toBe(100)
		expect(env.epoch).toBe(0)
	})

	test('hit side right', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = env._size[0]
		state[1] = 100
		state[2] = 1
		state[3] = 1
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0] + 1)
		expect(info.state[1]).toBe(state[1] + 1)
		expect(info.state[2]).toBe(-1)
		expect(info.state[3]).toBe(1)
		expect(info.state[4]).toBe(100)
		expect(env.epoch).toBe(0)
	})

	test('hit top', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 100
		state[1] = env._size[1]
		state[2] = -1
		state[3] = 1
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0] - 1)
		expect(info.state[1]).toBe(state[1] + 1)
		expect(info.state[2]).toBe(-1)
		expect(info.state[3]).toBe(-1)
		expect(info.state[4]).toBe(100)
		expect(env.epoch).toBe(0)
	})

	test('hit bottom', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = 100
		state[1] = 0
		state[2] = -1
		state[3] = 1
		state[4] = 100

		const info = env.test(state, [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(-1000)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0] - 1)
		expect(info.state[1]).toBe(state[1] + 1)
		expect(info.state[2]).toBe(-1)
		expect(info.state[3]).toBe(1)
		expect(info.state[4]).toBe(100)
		expect(env.epoch).toBe(0)
	})

	test('hit block', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = env._padding[0][0]
		state[1] = env._padding[1][0]
		state[2] = 1
		state[3] = 1
		state[4] = 100
		expect(state[5]).toBe(1)

		const info = env.test(state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(100)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0] + 1)
		expect(info.state[1]).toBe(state[1] + 1)
		expect(info.state[2]).toBe(-1)
		expect(info.state[3]).toBe(1)
		expect(info.state[4]).toBe(100)
		expect(info.state[5]).toBe(0)
		expect(env.epoch).toBe(0)
	})

	test('have breaked block', () => {
		const env = new BreakerRLEnvironment()
		const state = env.reset()
		state[0] = env._padding[0][0]
		state[1] = env._padding[1][0]
		state[2] = 1
		state[3] = 1
		state[4] = 100

		const info0 = env.test(state, [0])
		const info = env.test(info0.state, [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0.1)
		expect(info.state).toHaveLength(85)
		expect(info.state[0]).toBe(state[0])
		expect(info.state[1]).toBe(state[1] + 2)
		expect(info.state[2]).toBe(-1)
		expect(info.state[3]).toBe(1)
		expect(info.state[4]).toBe(100)
		expect(info.state[5]).toBe(0)
		expect(env.epoch).toBe(0)
	})
})
