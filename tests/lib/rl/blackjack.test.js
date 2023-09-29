import BlackjackRLEnvironment from '../../../lib/rl/blackjack.js'

test('constructor', () => {
	const env = new BlackjackRLEnvironment()
	expect(env).toBeDefined()
})

test('actions', () => {
	const env = new BlackjackRLEnvironment()
	expect(env.actions).toEqual([[0, 1]])
})

test('states', () => {
	const env = new BlackjackRLEnvironment()
	expect(env.states).toHaveLength(3)
})

test('reset', () => {
	const env = new BlackjackRLEnvironment()
	const init_state = env.reset()
	expect(init_state[0]).toBeGreaterThanOrEqual(2)
	expect(init_state[0]).toBeLessThanOrEqual(21)
	expect(init_state[1]).toBeGreaterThanOrEqual(1)
	expect(init_state[1]).toBeLessThanOrEqual(10)
	expect(init_state[2]).toBeGreaterThanOrEqual(0)
	expect(init_state[2]).toBeLessThanOrEqual(1)
	expect(env.state()).toEqual(init_state)
})

describe('state', () => {
	test('init', () => {
		const env = new BlackjackRLEnvironment()
		const state = env.state()
		expect(state[0]).toBeGreaterThanOrEqual(2)
		expect(state[0]).toBeLessThanOrEqual(21)
		expect(state[1]).toBeGreaterThanOrEqual(1)
		expect(state[1]).toBeLessThanOrEqual(10)
		expect(state[2]).toBeGreaterThanOrEqual(0)
		expect(state[2]).toBeLessThanOrEqual(1)
	})
})

describe('step', () => {
	test('step stick', () => {
		const env = new BlackjackRLEnvironment()
		const info = env.step([0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})

	test('step stick deal dealer cards', () => {
		const env = new BlackjackRLEnvironment()
		env._dealer_hands[0].value = 2
		env._dealer_hands[1].value = 3
		const info = env.step([0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})

	test('step hit not bust', () => {
		const env = new BlackjackRLEnvironment()
		env._player_hands[0].value = 2
		env._player_hands[1].value = 3
		const info = env.step([1])
		expect(info.done).toBeFalsy()
		expect(info.reward).toBe(0)
		expect(info.state).toBeInstanceOf(Array)
	})

	test('step hit bust', () => {
		const env = new BlackjackRLEnvironment()
		let info = env.step([1])
		while (!info.done) {
			info = env.step([1])
		}
		expect(info.done).toBeTruthy()
		expect(info.reward).toBeLessThan(0)
		expect(info.state).toBeInstanceOf(Array)
	})

	test('usableace', () => {
		const env = new BlackjackRLEnvironment()
		env._player_hands = [
			{ suit: 0, value: 1 },
			{ suit: 0, value: 2 },
		]
		const info = env.step([0])
		expect(info.done).toBeTruthy()
		expect(info.reward).toBeDefined()
		expect(info.state).toBeInstanceOf(Array)
	})
})
