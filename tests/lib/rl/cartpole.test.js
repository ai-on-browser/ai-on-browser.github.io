import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'

test('constructor', () => {
	const env = new CartPoleRLEnvironment()
})

test('actions', () => {
	const env = new CartPoleRLEnvironment()
	expect(env.actions).toEqual([[0, 1]])
})

test('states', () => {
	const env = new CartPoleRLEnvironment()
	expect(env.states).toHaveLength(4)
})

test('reset', () => {
	const env = new CartPoleRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toHaveLength(4)
	for (let i = 0; i < 4; i++) {
		expect(init_state[i]).toBeGreaterThanOrEqual(-0.05)
		expect(init_state[i]).toBeLessThanOrEqual(0.05)
	}
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const env = new CartPoleRLEnvironment()
		expect(env.state()).toHaveLength(4)
	})
})

test('step', () => {
	const env = new CartPoleRLEnvironment()
	expect(env.epoch).toBe(0)
	env.step(env.sample_action())
	expect(env.epoch).toBe(1)
})

describe('test', () => {
	test('step 0', () => {
		const env = new CartPoleRLEnvironment()
		const info = env.test([0, 0, 0, 0], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(1)
		expect(info.state[0]).toBe(0)
		expect(info.state[1]).toBe(0)
		expect(info.state[2]).toBeLessThan(0)
		expect(info.state[3]).toBeGreaterThan(0)
	})

	test('step 1', () => {
		const env = new CartPoleRLEnvironment()
		const info = env.test([0, 0, 0, 0], [1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(1)
		expect(info.state[0]).toBe(0)
		expect(info.state[1]).toBe(0)
		expect(info.state[2]).toBeGreaterThan(0)
		expect(info.state[3]).toBeLessThan(0)
	})

	test('goal', () => {
		const env = new CartPoleRLEnvironment()
		env._epoch = 200
		const info = env.test([0, 0, 0, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(1)
	})

	test('fail angle', () => {
		const env = new CartPoleRLEnvironment()
		const info = env.test([0, (12 / 180) * Math.PI, 0, 0.1], [1])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
	})

	test('fail position', () => {
		const env = new CartPoleRLEnvironment()
		const info = env.test([2.4, 0, 0.1, 0], [1])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
	})
})
