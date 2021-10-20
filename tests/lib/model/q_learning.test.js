import QAgent from '../../../lib/model/q_learning.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test('default', () => {
	const env = new GridRLEnvironment()
	const agent = new QAgent(env, env.size[0])

	let totalReward = 0
	const n = 1000
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		while (true) {
			const action = agent.get_action(env, curState, 0.01)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward)
			totalReward += reward
			curState = state
			if (done) {
				break
			}
		}
	}
	expect(totalReward / n).toBeGreaterThan(-60)
	const score = agent.get_score(env)
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})
