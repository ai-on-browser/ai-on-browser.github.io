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

test.todo('test')
