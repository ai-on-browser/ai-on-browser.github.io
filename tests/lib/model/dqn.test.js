import { jest } from '@jest/globals'
jest.retryTimes(3)

import DQNAgent from '../../../lib/model/dqn.js'
import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'

test('update', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new DQNAgent(env, 10, [{ type: 'full', out_size: 5, activation: 'tanh' }], 'adam')

	const n = 1000
	let totalReward = -Infinity
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalReward = 0
		while (true) {
			const action = agent.get_action(curState, 1 - (i / n) ** 2)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward, done, 0.001, 10)
			totalReward += reward
			curState = state
			if (done) {
				break
			}
		}
		if (totalReward > 150) {
			return
		}
	}
	expect(totalReward).toBeGreaterThan(150)
})

test('get_score', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new DQNAgent(env, 20, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')

	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(20)
	expect(score[0][0]).toHaveLength(20)
	expect(score[0][0][0]).toHaveLength(20)
	expect(score[0][0][0][0]).toHaveLength(2)
})
