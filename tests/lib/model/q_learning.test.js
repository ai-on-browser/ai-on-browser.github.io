import QAgent, { QTableBase } from '../../../lib/model/q_learning.js'
import { RLIntRange, RLRealRange } from '../../../lib/rl/base.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'
import InHypercubeRLEnvironment from '../../../lib/rl/inhypercube.js'
import Tensor from '../../../lib/util/tensor.js'

describe('Q table base', () => {
	describe('array state/action', () => {
		const env = {
			states: [
				[1, 2],
				[1, 2, 3],
			],
			actions: [[-1, 1]],
		}

		test('tensor', () => {
			const table = new QTableBase(env)
			expect(table.tensor).toBeInstanceOf(Tensor)
			expect(table.tensor.sizes).toEqual([2, 3, 2])
		})

		test('state', () => {
			const table = new QTableBase(env)
			expect(table._state_index([2, 1])).toEqual([1, 0])
			expect(table._state_value([1, 0])).toEqual([2, 1])
		})

		test('action', () => {
			const table = new QTableBase(env)
			expect(table._action_index([-1])).toEqual([0])
			expect(table._action_value([0])).toEqual([-1])
		})
	})

	describe('real state/action', () => {
		const env = {
			states: [new RLRealRange(0, 1), new RLRealRange(-1, 1)],
			actions: [new RLRealRange(-1, 1)],
		}

		test('tensor', () => {
			const table = new QTableBase(env)
			expect(table.tensor).toBeInstanceOf(Tensor)
			expect(table.tensor.sizes).toEqual([20, 20, 20])
		})

		test('state', () => {
			const table = new QTableBase(env)
			expect(table._state_index([0.3, -0.2])).toEqual([6, 8])
			expect(table._state_value([4, 7])[0]).toBeCloseTo(0.2)
			expect(table._state_value([4, 7])[1]).toBeCloseTo(-0.3)
		})

		test('action', () => {
			const table = new QTableBase(env)
			expect(table._action_index([-0.5])).toEqual([5])
			expect(table._action_value([12])[0]).toBeCloseTo(0.2)
		})
	})

	describe('int state/action', () => {
		const env = {
			states: [new RLIntRange(0, 5), new RLIntRange(-2, 2)],
			actions: [new RLIntRange(-1, 1)],
		}

		test('tensor', () => {
			const table = new QTableBase(env)
			expect(table.tensor).toBeInstanceOf(Tensor)
			expect(table.tensor.sizes).toEqual([6, 5, 3])
		})

		test('state', () => {
			const table = new QTableBase(env)
			expect(table._state_index([0.3, -0.2])).toEqual([0, 2])
			expect(table._state_value([4, 2])[0]).toBe(4)
			expect(table._state_value([1, 4])[1]).toBe(2)
		})

		test('action', () => {
			const table = new QTableBase(env)
			expect(() => table._action_index([-1])).toThrow('Not implemented')
			expect(() => table._action_value([1])).toThrow('Not implemented')
		})
	})
})

describe('constructor', () => {
	test('default', () => {
		const env = new InHypercubeRLEnvironment()
		const agent = new QAgent(env)

		expect(agent._table.resolution).toBe(20)
	})

	test('resolution', () => {
		const env = new InHypercubeRLEnvironment()
		const agent = new QAgent(env, 6)

		expect(agent._table.resolution).toBe(6)
	})
})

test('update', () => {
	const env = new GridRLEnvironment()
	const agent = new QAgent(env, env.size[0])

	const n = 10000
	let totalReward = -Infinity
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalReward = 0
		while (true) {
			const action = agent.get_action(curState, 0.01)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward)
			totalReward += reward
			curState = state
			if (done) {
				break
			}
		}

		if (totalReward > -30) {
			break
		}
	}
	expect(totalReward).toBeGreaterThan(-30)
})

test('get_score', () => {
	const env = new GridRLEnvironment()
	const agent = new QAgent(env, env.size[0])

	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})

test('get_action default', () => {
	const env = new GridRLEnvironment()
	const agent = new QAgent(env, env.size[0])

	const action = agent.get_action(env.state())
	expect(action).toHaveLength(1)
})
