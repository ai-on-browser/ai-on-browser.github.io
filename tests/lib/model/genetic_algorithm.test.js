import { jest } from '@jest/globals'
jest.retryTimes(3)

import GeneticAlgorithmGeneration from '../../../lib/model/genetic_algorithm.js'
import CartPoleRLEnvironment from '../../../lib/rl/cartpole.js'

test('next', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new GeneticAlgorithmGeneration(env, 100, 10)
	for (let i = 0; i < 100; i++) {
		agent.run()
		agent.next(0.1)
		if (agent.top_agent().total_reward > 150) {
			break
		}
	}

	expect(agent.top_agent().total_reward).toBeGreaterThan(150)
})

test('get_score', () => {
	const env = new CartPoleRLEnvironment()
	const agent = new GeneticAlgorithmGeneration(env, 100, 10)

	const score = agent.get_score()
	expect(score).toHaveLength(10)
	expect(score[0]).toHaveLength(10)
	expect(score[0][0]).toHaveLength(10)
	expect(score[0][0][0]).toHaveLength(10)
	expect(score[0][0][0][0]).toHaveLength(2)
})
