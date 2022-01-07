import { jest } from '@jest/globals'
jest.retryTimes(3)

import PGAgent from '../../../lib/model/policy_gradient.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test('default', () => {
	const env = new GridRLEnvironment()
	env._size = [5, 5]
	const agent = new PGAgent(env, env.size[0])

	const totalRewards = []
	const n = 1000
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalRewards[i] = 0
		let cnt = 0
		while (cnt++ < 1000) {
			const action = agent.get_action(curState)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, reward, done, 0.1)
			totalRewards[i] += reward
			curState = state
			if (done) {
				break
			}
		}
		agent.reset()
	}
	expect(totalRewards.slice(-5).reduce((s, v) => s + v, 0) / 5).toBeGreaterThan(-10)
	const score = agent.get_score()
	expect(score).toHaveLength(5)
	expect(score[0]).toHaveLength(5)
	expect(score[0][0]).toHaveLength(4)
})
