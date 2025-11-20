import SmoothMazeRLEnvironment from '../../../lib/rl/maze.js'

test('constructor', () => {
	const env = new SmoothMazeRLEnvironment(100, 100)
	expect(env).toBeDefined()
})

test('actions', () => {
	const env = new SmoothMazeRLEnvironment(100, 100)
	expect(env.actions).toEqual([[0, 1, 2, 3]])
})

test('states', () => {
	const env = new SmoothMazeRLEnvironment(100, 100)
	expect(env.states).toHaveLength(3)
})

describe('map', () => {
	test('default', () => {
		const env = new SmoothMazeRLEnvironment(100, 100)
		const map = env.map
		expect(map).toHaveLength(100)
		for (let i = 0; i < 100; i++) {
			expect(map[i]).toHaveLength(50)
			for (let j = 0; j < 50; j++) {
				expect(map[i][j]).toBeFalsy()
			}
		}
	})

	test('wall', () => {
		const env = new SmoothMazeRLEnvironment(100, 100)
		const wall = []
		for (let i = 0; i < 100; i++) {
			wall.push([Math.floor(Math.random() * 100), Math.floor(Math.random() * 50)])
		}
		env._points.push(...wall)
		const map = env.map
		expect(map).toHaveLength(100)
		expect(map[0][0]).toBeFalsy()
		expect(map[99][49]).toBeFalsy()
		for (let i = 0; i < 20; i++) {
			expect(map[i]).toHaveLength(50)
			for (let j = 0; j < 10; j++) {
				if ((i === 0 && j === 0) || (i === 99 && j === 49)) {
					continue
				}
				expect(!!map[i][j]).toBe(wall.reduce((s, v) => s + (v[0] === i && v[1] === j ? 1 : 0), 0) % 2 === 1)
			}
		}
	})
})

test('reset', () => {
	const w = 100
	const h = 100
	const env = new SmoothMazeRLEnvironment(w, h)
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state[0]).toBeGreaterThanOrEqual(0)
	expect(init_state[0]).toBeLessThan(w / 4)
	expect(init_state[1]).toBeGreaterThanOrEqual(0)
	expect(init_state[1]).toBeLessThan(h / 4)
	expect(init_state[2]).toBeGreaterThanOrEqual(0)
	expect(init_state[2]).toBeLessThan(360)
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const w = 100
		const h = 100
		const env = new SmoothMazeRLEnvironment(w, h)
		const state = env.state()
		expect(state[0]).toBeGreaterThanOrEqual(0)
		expect(state[0]).toBeLessThan(w / 4)
		expect(state[1]).toBeGreaterThanOrEqual(0)
		expect(state[1]).toBeLessThan(h / 4)
		expect(state[2]).toBeGreaterThanOrEqual(0)
		expect(state[2]).toBeLessThan(360)
	})
})

test('step', () => {
	const env = new SmoothMazeRLEnvironment(100, 100)
	expect(env.epoch).toBe(0)
	const info = env.step([0])
	expect(env.epoch).toBe(1)
	expect(info.done).toBeFalsy()
	expect(info.reward).toBe(-1)
	expect(info.state).toHaveLength(3)
})

describe('test', () => {
	test.each([
		[[0, 0, 0], [0], [10, 0, 0]],
		[[0, 0, 90], [0], [0, 10, 90]],
		[[20, 0, 0], [1], [10, 0, 0]],
		[[10, 20, 0], [2], [10, 20, 5]],
		[[10, 20, 0], [3], [10, 20, 355]],
	])('step %j, %i, %j', (pstate, act, nstate) => {
		const env = new SmoothMazeRLEnvironment(100, 100)
		const info = env.test(pstate, act)
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		for (let i = 0; i < 3; i++) {
			expect(info.state[i]).toBeCloseTo(nstate[i])
		}
	})

	test.each([
		[0, [100, 5, 0]],
		[1, [100, 5, 180]],
		[0, [3, 100, 90]],
		[1, [3, 100, 270]],
		[1, [0, 7, 0]],
		[0, [0, 7, 180]],
		[1, [4, 0, 90]],
		[0, [4, 0, 270]],
	])('edge %i %j', (act, state) => {
		const env = new SmoothMazeRLEnvironment(100, 100)
		const info = env.test(state, [act])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-2)
		expect(info.state).toEqual(state)
	})

	test('wall', () => {
		const env = new SmoothMazeRLEnvironment(100, 50)
		env._points.push([15, 10])
		const info = env.test([5, 10, 0], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-2)
		expect(info.state).toEqual([5, 10, 0])
	})

	test('goal', () => {
		const env = new SmoothMazeRLEnvironment(100, 100)
		const info = env.test([85, 85, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(200)
		expect(info.state).toEqual([95, 85, 0])
	})

	test('fail', () => {
		const env = new SmoothMazeRLEnvironment(100, 100)
		env._max_step = 10
		env._epoch = 10
		const info = env.test([5, 4, 0], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(-100)
		expect(info.state).toEqual([15, 4, 0])
	})
})
