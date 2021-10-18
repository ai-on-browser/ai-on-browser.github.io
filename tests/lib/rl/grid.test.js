import GridRLEnvironment from '../../../lib/rl/grid.js'

test('constructor', () => {
	const env = new GridRLEnvironment()
})

test('size', () => {
	const env = new GridRLEnvironment()
	expect(env.size).toEqual([20, 10])
})

test('actions', () => {
	const env = new GridRLEnvironment()
	expect(env.actions).toEqual([[0, 1, 2, 3]])
})

test('states', () => {
	const env = new GridRLEnvironment()
	expect(env.states).toHaveLength(2)
})

describe('map', () => {
	test('default', () => {
		const env = new GridRLEnvironment()
		const map = env.map
		expect(map).toHaveLength(20)
		for (let i = 0; i < 20; i++) {
			expect(map[i]).toHaveLength(10)
			for (let j = 0; j < 10; j++) {
				expect(map[i][j]).toBeFalsy()
			}
		}
	})

	test('wall', () => {
		const env = new GridRLEnvironment()
		const wall = []
		for (let i = 0; i < 100; i++) {
			wall.push([Math.floor(Math.random() * 20), Math.floor(Math.random() * 10)])
		}
		env._points.push(...wall)
		const map = env.map
		expect(map).toHaveLength(20)
		for (let i = 0; i < 20; i++) {
			expect(map[i]).toHaveLength(10)
			for (let j = 0; j < 10; j++) {
				if (i === 0 && j === 0) {
					expect(map[i][j]).toBeFalsy()
				} else if (i === 19 && j === 9) {
					expect(map[i][j]).toBeFalsy()
				} else if (wall.reduce((s, v) => s + (v[0] === i && v[1] === j ? 1 : 0), 0) % 2 === 1) {
					expect(map[i][j]).toBeTruthy()
				} else {
					expect(map[i][j]).toBeFalsy()
				}
			}
		}
	})
})

test('reset', () => {
	const env = new GridRLEnvironment()
	for (let i = 0; i < 10; i++) {
		env.step(env.sample_action())
	}
	const init_state = env.reset()
	expect(init_state).toEqual([0, 0])
	expect(env.state()).toEqual([0, 0])
})

describe('state', () => {
	test('init', () => {
		const env = new GridRLEnvironment()
		expect(env.state()).toEqual([0, 0])
	})
})

test('step', () => {
	const env = new GridRLEnvironment()
	expect(env.epoch).toBe(0)
	env.step([0])
	expect(env.epoch).toBe(1)
})

describe('test', () => {
	test('step', () => {
		const env = new GridRLEnvironment()
		const info = env.test([2, 3], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-1)
		expect(info.state).toEqual([3, 3])
	})

	test.each([
		[0, [19, 5]],
		[1, [3, 9]],
		[2, [0, 7]],
		[3, [4, 0]],
	])('edge %i', (act, state) => {
		const env = new GridRLEnvironment()
		const info = env.test(state, [act])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-2)
		expect(info.state).toEqual(state)
	})

	test('wall', () => {
		const env = new GridRLEnvironment()
		env._points.push([6, 4])
		const info = env.test([5, 4], [0])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(-2)
		expect(info.state).toEqual([5, 4])
	})

	test('goal', () => {
		const env = new GridRLEnvironment()
		const info = env.test([18, 9], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(5)
		expect(info.state).toEqual([19, 9])
	})

	test('fail', () => {
		const env = new GridRLEnvironment()
		env._max_step = 10
		env._epoch = 10
		const info = env.test([5, 4], [0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBe(-100)
		expect(info.state).toEqual([6, 4])
	})
})
