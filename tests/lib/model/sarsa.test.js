import SARSAAgent from '../../../lib/model/sarsa.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test('update', () => {
	const env = new GridRLEnvironment()
	const agent = new SARSAAgent(env, env.size[0])

	const n = 10000
	for (let i = 0; i < n; i++) {
		let curState = env.reset()
		let totalReward = 0
		while (true) {
			const action = agent.get_action(curState, 0.01)
			const { state, reward, done } = env.step(action)
			agent.update(action, curState, state, reward)
			totalReward += reward
			curState = state
			if (done) {
				agent.reset()
				break
			}
		}

		if (totalReward > -30) {
			return
		}
	}
	throw new Error('Score does not converge.')
})

test('get_score', () => {
	const env = new GridRLEnvironment()
	const agent = new SARSAAgent(env, env.size[0])

	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})
