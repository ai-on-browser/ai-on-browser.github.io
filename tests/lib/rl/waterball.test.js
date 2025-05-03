import WaterballRLEnvironment from '../../../lib/rl/waterball.js'

test('constructor', () => {
	const env = new WaterballRLEnvironment(100, 100)
	expect(env).toBeDefined()
})

test('actions', () => {
	const env = new WaterballRLEnvironment(100, 100)
	expect(env.actions).toEqual([[0, 1, 2, 3]])
})

test('states', () => {
	const env = new WaterballRLEnvironment(100, 100)
	expect(env.states).toHaveLength(82)
	expect(env.states).toHaveLength(82)
})

test('reset', () => {
	const w = 100
	const h = 100
	const env = new WaterballRLEnvironment(w, h)
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state[0]).toBeGreaterThanOrEqual(-1)
	expect(init_state[0]).toBeLessThan(1)
	expect(init_state[1]).toBeGreaterThanOrEqual(-1)
	expect(init_state[1]).toBeLessThan(1)
	for (let i = 0; i < 20; i++) {
		expect(init_state[2 + 4 * i]).toBeGreaterThanOrEqual(0)
		expect(init_state[2 + 4 * i]).toBeLessThan(80)
		expect(['none', 'wall', 'apple', 'poison']).toContain(init_state[2 + 4 * i + 1])
		expect(init_state[2 + 4 * i + 2]).toBeGreaterThanOrEqual(-0.5)
		expect(init_state[2 + 4 * i + 2]).toBeLessThan(0.5)
		expect(init_state[2 + 4 * i + 3]).toBeGreaterThanOrEqual(-0.5)
		expect(init_state[2 + 4 * i + 3]).toBeLessThan(0.5)
	}
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const w = 100
		const h = 100
		const env = new WaterballRLEnvironment(w, h)
		const state = env.state()
		expect(state[0]).toBeGreaterThanOrEqual(-1)
		expect(state[0]).toBeLessThan(1)
		expect(state[1]).toBeGreaterThanOrEqual(-1)
		expect(state[1]).toBeLessThan(1)
		for (let i = 0; i < 20; i++) {
			expect(state[2 + 4 * i]).toBeGreaterThanOrEqual(0)
			expect(state[2 + 4 * i]).toBeLessThan(80)
			expect(['none', 'wall', 'apple', 'poison']).toContain(state[2 + 4 * i + 1])
			expect(state[2 + 4 * i + 2]).toBeGreaterThanOrEqual(-0.5)
			expect(state[2 + 4 * i + 2]).toBeLessThan(0.5)
			expect(state[2 + 4 * i + 3]).toBeGreaterThanOrEqual(-0.5)
			expect(state[2 + 4 * i + 3]).toBeLessThan(0.5)
		}
	})

	test('history_state_size', () => {
		const w = 100
		const h = 100
		const env = new WaterballRLEnvironment(w, h)
		env._history_state_size = 2
		const state = env.state()
		expect(state[0]).toBeGreaterThanOrEqual(-1)
		expect(state[0]).toBeLessThan(1)
		expect(state[1]).toBeGreaterThanOrEqual(-1)
		expect(state[1]).toBeLessThan(1)
		for (let i = 0; i < 20; i++) {
			expect(state[2 + 4 * i]).toBeGreaterThanOrEqual(0)
			expect(state[2 + 4 * i]).toBeLessThan(80)
			expect(['none', 'wall', 'apple', 'poison']).toContain(state[2 + 4 * i + 1])
			expect(state[2 + 4 * i + 2]).toBeGreaterThanOrEqual(-0.5)
			expect(state[2 + 4 * i + 2]).toBeLessThan(0.5)
			expect(state[2 + 4 * i + 3]).toBeGreaterThanOrEqual(-0.5)
			expect(state[2 + 4 * i + 3]).toBeLessThan(0.5)
		}
	})
})

describe('step', () => {
	test.each([0, 1, 2, 3])('step %p', action => {
		const env = new WaterballRLEnvironment(100, 100)
		const info = env.step([action])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})

	test('big velocity', () => {
		const env = new WaterballRLEnvironment(100, 100)
		for (let i = 0; i < 20; i++) {
			env.step([0])
		}
		const info = env.step([0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
		expect(info.state[0]).toBe(env._agent_max_velocity)
	})

	test('small velocity', () => {
		const env = new WaterballRLEnvironment(100, 100)
		for (let i = 0; i < 20; i++) {
			env.step([1])
		}
		const info = env.step([1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
		expect(info.state[0]).toBe(-env._agent_max_velocity)
	})

	test('touch wall max', () => {
		const env = new WaterballRLEnvironment(100, 100)
		for (let i = 0; i < 60; i++) {
			env.step([0])
		}
		const info = env.step([0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})

	test('touch wall min', () => {
		const env = new WaterballRLEnvironment(100, 100)
		for (let i = 0; i < 60; i++) {
			env.step([1])
		}
		const info = env.step([1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})

	test('add ball', () => {
		const env = new WaterballRLEnvironment(10, 10)
		for (let i = 0; i < 1000; i++) {
			env.step([Math.floor(Math.random() * 4)])
		}
		const info = env.step([1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})
})
