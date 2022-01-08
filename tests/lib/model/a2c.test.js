import { jest } from '@jest/globals'
jest.retryTimes(3)

import A2CAgent from '../../../lib/model/a2c.js'
import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'

test('update', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new A2CAgent(env, 20, 10, [{ type: 'full', out_size: 5, activation: 'tanh' }], 'adam')
	for (let i = 0; i < 10000; i++) {
		agent.update(true, 0.01, 10)

		let totalReward = 0
		let curState = env.reset()
		let cnt = 0
		while (cnt++ < 10000) {
			const action = agent.get_action(curState)
			const { state, reward, done } = env.step(action)
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
	throw new Error('Score does not converge.')
})

test('get_score', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new A2CAgent(env, 20, 10, [{ type: 'full', out_size: 5, activation: 'tanh' }], 'adam')

	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(20)
	expect(score[0][0]).toHaveLength(20)
	expect(score[0][0][0]).toHaveLength(20)
	expect(score[0][0][0][0]).toHaveLength(2)
})
