import { jest } from '@jest/globals'
jest.retryTimes(3)

import PGAgent from '../../../lib/model/policy_gradient.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test('update', () => {
	const env = new GridRLEnvironment()
	env._size = [5, 5]
	const agent = new PGAgent(env, env.size[0])

	const n = 1000
	let totalReward = -Infinity
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalReward = 0
		let cnt = 0
		while (cnt++ < 1000) {
			const action = agent.get_action(curState)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, reward, done, 0.1)
			totalReward += reward
			curState = state
			if (done) {
				break
			}
		}
		agent.reset()

		if (totalReward > -10) {
			return
		}
	}
	expect(totalReward).toBeGreaterThan(-10)
})

test('get_score', () => {
	const env = new GridRLEnvironment()
	const agent = new PGAgent(env, env.size[0])

	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})
