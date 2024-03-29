import GeneticAlgorithmGeneration from '../../lib/model/genetic_algorithm.js'
import Controller from '../controller.js'

var dispGeneticAlgorithm = function (elm, env) {
	const controller = new Controller(env)
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 10
	env.reward = 'achieve'

	let agent = new GeneticAlgorithmGeneration(env, 100, initResolution)
	let generation = 0
	let score_history = []
	env.reset(agent)
	env.render(() => agent.get_score())

	const step = () => {
		agent.run()
		score_history.push(agent.top_agent().total_reward)
		const mutation_rate = +elm.select('[name=mutation_rate]').property('value')
		agent.next(mutation_rate)
		env.reset(agent)
		env.render(() => agent.get_score())
		elm.select('[name=generation]').text(++generation)
		elm.select('[name=scores]').text(' [' + score_history.slice(-10).reverse().join(',') + ']')
	}

	elm.append('span').text('Generation size')
	elm.append('input').attr('type', 'number').attr('name', 'size').attr('min', 5).attr('max', 200).attr('value', 100)
	elm.append('span').text('Resolution')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'resolution')
		.attr('min', 2)
		.attr('max', 100)
		.attr('value', initResolution)
	const slbConf = controller.stepLoopButtons().init(() => {
		const size = +elm.select('[name=size]').property('value')
		const resolution = +elm.select('[name=resolution]').property('value')
		agent = new GeneticAlgorithmGeneration(env, size, resolution)
		score_history = []
		env.reset(agent)
		env.render(() => agent.get_score())
		elm.select('[name=generation]').text((generation = 0))
		elm.select('[name=scores]').text('')
	})
	elm.append('span').text('Mutation rate')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'mutation_rate')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', '0.0001')
		.attr('value', '0.001')
	slbConf.step(step)
	elm.append('span').text(' Generation: ')
	elm.append('span').attr('name', 'generation').text(generation)
	let isTesting = false
	const testButton = elm
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Test')
		.on('click', function () {
			isTesting = !isTesting
			testButton.attr('value', isTesting ? 'Stop' : 'Test')
			if (isTesting) {
				const topAgent = agent.top_agent()
				let cur_state = env.reset(topAgent)
				void (function loop() {
					const action = topAgent.get_action(cur_state)
					const { state, done } = env.step(action, topAgent)
					cur_state = state
					env.render()
					if (isTesting && !done) {
						setTimeout(() => loop(), 0)
					} else {
						isTesting = false
						testButton.attr('value', 'Test')
					}
				})()
			}
		})

	elm.append('span').attr('name', 'scores')

	return () => {
		isTesting = false
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	platform.setting.terminate = dispGeneticAlgorithm(platform.setting.ml.configElement, platform)
}
