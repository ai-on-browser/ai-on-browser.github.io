import GeneticAlgorithmGeneration from '../../lib/model/genetic_algorithm.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	const controller = new Controller(platform)
	const initResolution = platform.type === 'grid' ? Math.max(...platform.env.size) : 10
	if (platform.type === 'grid' || platform.type === 'maze') {
		platform.env.rewardReviver = info => {
			if (info._reward !== -1) {
				return 0
			}
			return Math.sqrt(info.state[0] ** 2 + info.state[1] ** 2)
		}
	} else if (platform.type === 'mountaincar') {
		platform.env.rewardReviver = info => {
			if (!info.done) {
				return 0
			}
			return (
				-Math.abs(info.state[0] - info._env._goal_position) + Math.abs(info.state[1] - info._env._goal_velocity)
			)
		}
	}

	let agent = new GeneticAlgorithmGeneration(platform, 100, initResolution)
	let generation = 0
	let score_history = []
	platform.reset(agent)
	platform.render(() => agent.get_score())

	const step = () => {
		agent.run()
		score_history.push(agent.top_agent().total_reward)
		agent.next(mutationRate.value)
		platform.reset(agent)
		platform.render(() => agent.get_score())
		generationText.value = ++generation
		scores.value = ` [${score_history.slice(-10).reverse().join(',')}]`
	}

	const size = controller.input.number({ label: 'Generation size', min: 5, max: 200, value: 100 })
	const resolution = controller.input.number({ label: 'Resolution', min: 2, max: 100, value: initResolution })
	const slbConf = controller.stepLoopButtons().init(() => {
		agent = new GeneticAlgorithmGeneration(platform, size.value, resolution.value)
		score_history = []
		platform.reset(agent)
		platform.render(() => agent.get_score())
		generationText.value = generation = 0
		scores.value = ''
	})
	const mutationRate = controller.input.number({ label: 'Mutation rate', min: 0, max: 1, step: 0.0001, value: 0.001 })
	slbConf.step(step)
	const generationText = controller.text({ label: ' Generation: ', value: generation })
	let isTesting = false
	const testButton = controller.input.button('Test').on('click', () => {
		isTesting = !isTesting
		testButton.element.value = isTesting ? 'Stop' : 'Test'
		if (isTesting) {
			const topAgent = agent.top_agent()
			let cur_state = platform.reset(topAgent)
			void (function loop() {
				const action = topAgent.get_action(cur_state)
				const { state, done } = platform.step(action, topAgent)
				cur_state = state
				platform.render()
				if (isTesting && !done) {
					setTimeout(() => loop(), 0)
				} else {
					isTesting = false
					testButton.element.value = 'Test'
				}
			})()
		}
	})

	const scores = controller.text()

	return () => {
		isTesting = false
	}
}
