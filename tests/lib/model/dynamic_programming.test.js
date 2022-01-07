import DPAgent from '../../../lib/model/dynamic_programming.js'
import GridRLEnvironment from '../../../lib/rl/grid.js'

test.each(['value', 'policy'])('default %s', method => {
	const env = new GridRLEnvironment()
	env.reset()
	const agent = new DPAgent(env, env.size[0])
	const n = 100
	for (let i = 0; i < n; i++) {
		agent.update(method)
	}

	let curState = env.reset()
	let totalReward = 0
	while (true) {
		const action = agent.get_action(curState)
		const { state, reward, done } = env.step(action)
		totalReward += reward
		curState = state
		if (done) {
			break
		}
	}
	expect(totalReward).toBeGreaterThan(-30)
	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(4)
})
