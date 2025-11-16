import A2CAgent from '../../../lib/model/a2c.js'
import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'
import InHypercubeRLEnvironment from '../../../lib/rl/inhypercube.js'
import PendulumRLEnvironment from '../../../lib/rl/pendulum.js'
import ReversiRLEnvironment from '../../../lib/rl/reversi.js'

test('update', { retry: 20 }, () => {
	const env = new InHypercubeRLEnvironment(2)
	const agent = new A2CAgent(env, 10, 10, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')

	const n = 200
	const totalReward = []
	for (let i = 0; i < n; i++) {
		agent.update(true, 0.01, 10)

		totalReward[i] = 0
		let curState = env.reset()
		let cnt = 0
		while (cnt++ < 10000) {
			const action = agent.get_action(curState)
			const { state, reward, done } = env.step(action)
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
	const agent = new A2CAgent(env, 10, 10, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')
	agent.update(true, 0.01, 10)

	let curState = env.reset()
	const best_action = agent.get_action(curState, 0)
	expect(best_action).toHaveLength(1)
})

test('array state action', () => {
	const env = new ReversiRLEnvironment()
	const agent = new A2CAgent(env, 10, 7, [{ type: 'full', out_size: 10, activation: 'tanh' }], 'adam')
	agent.update(true, 0.01, 10)

	let curState = env.reset()
	const best_action = agent.get_action(curState, 0)
	expect(best_action).toHaveLength(1)
})

test('get_score', { retry: 20 }, () => {
	const env = new CartPoleRLEnvironment()
	const agent = new A2CAgent(env, 20, 10, [{ type: 'full', out_size: 5, activation: 'tanh' }], 'adam')

	const score = agent.get_score()
	expect(score).toHaveLength(20)
	expect(score[0]).toHaveLength(20)
	expect(score[0][0]).toHaveLength(20)
	expect(score[0][0][0]).toHaveLength(20)
	expect(score[0][0][0][0]).toHaveLength(2)

	agent.get_score()
})
