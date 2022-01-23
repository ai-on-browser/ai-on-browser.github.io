import AcrobotRLEnvironment from '../../../lib/rl/acrobot.js'

test('constructor', () => {
	const env = new AcrobotRLEnvironment()
	expect(env).toBeDefined()
})

test('actions', () => {
	const env = new AcrobotRLEnvironment()
	expect(env.actions).toEqual([[-1, 0, 1]])
})

test('states', () => {
	const env = new AcrobotRLEnvironment()
	expect(env.states).toHaveLength(4)
})

test('reset', () => {
	const env = new AcrobotRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toHaveLength(4)
	for (let i = 0; i < 4; i++) {
		expect(init_state[i]).toBeGreaterThanOrEqual(-0.1)
		expect(init_state[i]).toBeLessThanOrEqual(0.1)
	}
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const env = new AcrobotRLEnvironment()
		expect(env.state()).toHaveLength(4)
	})
})

test('step', () => {
	const env = new AcrobotRLEnvironment()
	expect(env.epoch).toBe(0)
	env.step(env.sample_action())
	expect(env.epoch).toBe(1)
})

describe('test', () => {
	test('step -1', () => {
		const env = new AcrobotRLEnvironment()
		const info = env.test([0, 0, 0, 0], [-1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state[0]).toBe(0)
		expect(info.state[1]).toBe(0)
		expect(info.state[2]).toBeGreaterThan(0)
		expect(info.state[3]).toBeLessThan(0)
	})

	test('step 0', () => {
		const env = new AcrobotRLEnvironment()
		const info = env.test([0, 0, 0, 0], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state[0]).toBe(0)
		expect(info.state[1]).toBe(0)
		expect(info.state[2]).toBeCloseTo(0)
		expect(info.state[3]).toBeCloseTo(0)
	})

	test('step 1', () => {
		const env = new AcrobotRLEnvironment()
		const info = env.test([0, 0, 0, 0], [1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state[0]).toBe(0)
		expect(info.state[1]).toBe(0)
		expect(info.state[2]).toBeLessThan(0)
		expect(info.state[3]).toBeGreaterThan(0)
	})

	test('goal', () => {
		const env = new AcrobotRLEnvironment()
		const info = env.test([Math.PI, Math.PI / 2, 0, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
	})

	test('fail', () => {
		const env = new AcrobotRLEnvironment()
		env._epoch = 200
		const info = env.test([0, 0, 0, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
	})
})
