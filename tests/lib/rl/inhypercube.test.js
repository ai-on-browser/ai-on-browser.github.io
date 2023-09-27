import InHypercubeRLEnvironment from '../../../lib/rl/inhypercube.js'

test('constructor', () => {
	const env = new InHypercubeRLEnvironment()
	expect(env).toBeDefined()
})

describe('actions', () => {
	test('2d', () => {
		const env = new InHypercubeRLEnvironment(2)
		expect(env.actions).toEqual([[0, 1, 2, 3]])
	})

	test('3d', () => {
		const env = new InHypercubeRLEnvironment(3)
		env._dim = 1
		expect(env.actions).toEqual([[0, 1, 2, 3, 4, 5]])
	})
})

test.each([1, 2, 3])('states %dd', d => {
	const env = new InHypercubeRLEnvironment(d)
	expect(env.states).toHaveLength(d * 2)
})

test('reset', () => {
	const env = new InHypercubeRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toEqual([0, 0, 0, 0])
	expect(env.state()).toEqual([0, 0, 0, 0])
})

describe('state', () => {
	test('init', () => {
		const env = new InHypercubeRLEnvironment()
		expect(env.state()).toEqual([0, 0, 0, 0])
	})
})

describe('step', () => {
	test('2d', () => {
		const env = new InHypercubeRLEnvironment()
		expect(env.epoch).toBe(0)
		const info = env.step([0])
		expect(env.epoch).toBe(1)
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0)
		expect(info.state).toEqual([0.1, 0, 0.1, 0])
	})
})

describe('test', () => {
	test('step', () => {
		const env = new InHypercubeRLEnvironment()
		const info = env.test([0, 0, 0, 0], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0)
		expect(info.state).toEqual([0.1, 0, 0.1, 0])
	})

	test('goal', () => {
		const env = new InHypercubeRLEnvironment()
		const info = env.test([-1, 0, 0, 0], [1])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(1)
		expect(info.state).toEqual([-1.1, 0, -0.1, 0])
	})

	test('fail', () => {
		const env = new InHypercubeRLEnvironment()
		const info = env.test([1, 0, 0, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(0)
		expect(info.state).toEqual([1.1, 0, 0.1, 0])
	})
})
