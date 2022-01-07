import SARSAAgent from '../../../lib/model/sarsa.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test('default', () => {
	const env = new GridRLEnvironment()
	const agent = new SARSAAgent(env, env.size[0])

	const totalRewards = []
	const n = 1000
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		totalRewards[i] = 0
		while (true) {
			const action = agent.get_action(curState, 0.01)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward)
			totalRewards[i] += reward
			curState = state
			if (done) {
				agent.reset()
				break
			}
		}
	}
	expect(totalRewards.slice(-5).reduce((s, v) => s + v, 0) / 5).toBeGreaterThan(-30)
	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})
