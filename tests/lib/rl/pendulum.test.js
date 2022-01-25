import PendulumRLEnvironment from '../../../lib/rl/pendulum.js'

test('constructor', () => {
	const env = new PendulumRLEnvironment()
	expect(env).toBeDefined()
})

test('actions', () => {
	const env = new PendulumRLEnvironment()
	expect(env.actions).toHaveLength(1)
})

test('states', () => {
	const env = new PendulumRLEnvironment()
	expect(env.states).toHaveLength(3)
})

test('reset', () => {
	const env = new PendulumRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toHaveLength(3)
	expect(init_state[0]).toBeGreaterThanOrEqual(-1)
	expect(init_state[0]).toBeLessThanOrEqual(1)
	expect(init_state[1]).toBeGreaterThanOrEqual(-1)
	expect(init_state[1]).toBeLessThanOrEqual(1)
	expect(init_state[2]).toBeGreaterThanOrEqual(-0.5)
	expect(init_state[2]).toBeLessThanOrEqual(0.5)
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const env = new PendulumRLEnvironment()
		expect(env.state()).toHaveLength(3)
	})
})

test('step', () => {
	const env = new PendulumRLEnvironment()
	expect(env.epoch).toBe(0)
	const info = env.step(env.sample_action())
	expect(env.epoch).toBe(1)
	expect(info.done).toBeFalsy()
	expect(info.reward).toBeCloseTo(0)
	expect(info.state).toHaveLength(3)
})
