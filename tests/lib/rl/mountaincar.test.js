import MountainCarRLEnvironment from '../../../lib/rl/mountaincar.js'

test('constructor', () => {
	const env = new MountainCarRLEnvironment()
})

test('actions', () => {
	const env = new MountainCarRLEnvironment()
	expect(env.actions).toEqual([[0, 1, 2]])
})

test('states', () => {
	const env = new MountainCarRLEnvironment()
	expect(env.states).toHaveLength(2)
})

test('reset', () => {
	const env = new MountainCarRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toHaveLength(2)
	expect(init_state[0]).toBeGreaterThanOrEqual(-0.6)
	expect(init_state[0]).toBeLessThanOrEqual(-0.4)
	expect(init_state[1]).toBe(0)
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const env = new MountainCarRLEnvironment()
		expect(env.state()).toHaveLength(2)
	})
})

test('step', () => {
	const env = new MountainCarRLEnvironment()
	expect(env.epoch).toBe(0)
	env.step(env.sample_action())
	expect(env.epoch).toBe(1)
})

describe('test', () => {
	test('step 0', () => {
		const env = new MountainCarRLEnvironment()
		const info = env.test([0, -0.01], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state[0]).toBe(-0.0135)
		expect(info.state[1]).toBe(-0.0135)
	})

	test('step 1', () => {
		const env = new MountainCarRLEnvironment()
		const info = env.test([0, -0.01], [1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state[0]).toBe(-0.0125)
		expect(info.state[1]).toBe(-0.0125)
	})

	test('step 2', () => {
		const env = new MountainCarRLEnvironment()
		const info = env.test([0, -0.01], [2])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state[0]).toBe(-0.0115)
		expect(info.state[1]).toBe(-0.0115)
	})

	test('goal', () => {
		const env = new MountainCarRLEnvironment()
		const info = env.test([0.5, 0.01], [2])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(-1)
	})

	test('fail', () => {
		const env = new MountainCarRLEnvironment()
		env._epoch = 200
		const info = env.test([0, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(-1)
	})
})
