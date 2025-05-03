import { expect, jest } from '@jest/globals'
jest.retryTimes(5)

import DQNAgent from '../../../lib/model/dqn.js'
import ReversiRLEnvironment from '../../../lib/rl/reversi.js'
import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'
import InHypercubeRLEnvironment from '../../../lib/rl/inhypercube.js'
import PendulumRLEnvironment from '../../../lib/rl/pendulum.js'

test('update dqn', () => {
	const env = new InHypercubeRLEnvironment(2)
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 3, activation: 'tanh' }], 'adam')

	const n = 200
	const totalReward = []
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalReward[i] = 0
		while (true) {
			const action = agent.get_action(curState, 1 - i / n)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward, done, 0.001, 10)
			totalReward[i] += reward
			curState = state
			if (done) {
				break
			}
		}
		if (totalReward.slice(Math.max(0, totalReward.length - 10)).every(v => v > 0)) {
			break
		}
	}
	expect(totalReward.slice(Math.max(0, totalReward.length - 10)).every(v => v > 0)).toBeTruthy()
	agent.terminate()
})

test('update ddqn', () => {
	const env = new InHypercubeRLEnvironment(2)
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 3, activation: 'tanh' }], 'adam')
	agent.method = 'DDQN'

	const n = 200
	const totalReward = []
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalReward[i] = 0
		while (true) {
			const action = agent.get_action(curState, 1 - i / n)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward, done, 0.001, 10)
			totalReward[i] += reward
			curState = state
			if (done) {
				break
			}
		}
		if (totalReward.slice(Math.max(0, totalReward.length - 10)).every(v => v > 0)) {
			break
		}
	}
	expect(totalReward.slice(Math.max(0, totalReward.length - 10)).every(v => v > 0)).toBeTruthy()
	agent.terminate()
})

test('realrange action', () => {
	const env = new PendulumRLEnvironment()
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 3, activation: 'tanh' }], 'adam')
	agent._net._batch_size = 1
	agent._net._fix_param_update_step = 1
	agent._net._do_update_step = 1

	let curState = env.reset()
	const action = agent.get_action(curState, 0.9)
	const { state, reward, done } = env.step(action)
	agent.update(action, curState, state, reward, done, 0.001, 10)

	const best_action = agent.get_action(state, 0)
	expect(best_action).toHaveLength(1)
})

test('array state action', () => {
	const env = new ReversiRLEnvironment()
	const agent = new DQNAgent(env, 20, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')

	agent._net._batch_size = 1
	agent._net._fix_param_update_step = 1
	agent._net._do_update_step = 1

	let curState = env.reset()
	const action = agent.get_action(curState, 0.9)
	const { state, reward, done } = env.step(action)
	agent.update(action, curState, state, reward, done, 0.001, 10)

	const best_action = agent.get_action(state, 0)
	expect(best_action).toHaveLength(1)
})

test('max memory size', () => {
	const env = new InHypercubeRLEnvironment(2)
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 3, activation: 'tanh' }], 'adam')
	agent.method = 'DDQN'
	agent._net._batch_size = 1
	agent._net._max_memory_size = 10

	let curState = env.reset()
	const action = agent.get_action(curState, 0.9)
	const { state, reward, done } = env.step(action)
	for (let i = 0; i < 20; i++) {
		agent.update(action, curState, state, reward, done, 0.001, 10)
		expect(agent._net._memory.length).toBeLessThanOrEqual(10)
	}
})

test('reset to dqn', () => {
	const env = new InHypercubeRLEnvironment(2)
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 3, activation: 'tanh' }], 'adam')
	agent.method = 'DDQN'
	agent._net._batch_size = 1
	agent._net._fix_param_update_step = 1
	agent._net._do_update_step = 1

	let curState = env.reset()
	const action = agent.get_action(curState, 0.9)
	const { state, reward, done } = env.step(action)
	agent.update(action, curState, state, reward, done, 0.001, 10)

	expect(agent._net._target).toBeDefined()
	agent.method = 'DQN'
	expect(agent._net._target).toBeNull()
})

test('get_score', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new DQNAgent(env, 12, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')

	const score = agent.get_score()
	expect(score).toHaveLength(12)
	expect(score[0]).toHaveLength(12)
	expect(score[0][0]).toHaveLength(12)
	expect(score[0][0][0]).toHaveLength(12)
	expect(score[0][0][0][0]).toHaveLength(2)

	agent.get_score()
})

test('get_action default', () => {
	const env = new InHypercubeRLEnvironment(2)
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 3, activation: 'tanh' }], 'adam')

	const action = agent.get_action(env.state())
	expect(action).toHaveLength(1)
})
