import PGAgent from '../../lib/model/policy_gradient.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	const controller = new Controller(platform)
	const initResolution = platform.type === 'grid' ? Math.max(...platform.env.size) : 20

	let agent = new PGAgent(platform, initResolution)
	let cur_state = platform.reset(agent)
	platform.render(() => agent.get_score())

	const step = (render = true) => {
		const action = agent.get_action(cur_state)
		const { state, reward, done } = platform.step(action, agent)
		agent.update(action, cur_state, reward, done, learningRate.value)
		if (render) {
			platform.render()
		}
		cur_state = state
		return done
	}

	const reset = () => {
		cur_state = platform.reset(agent)
		agent.reset()
		platform.render(() => agent.get_score())
	}

	const resolution = controller.input.number({ label: 'Resolution', min: 2, max: 100, value: initResolution })
	const slbConf = controller.stepLoopButtons().init(() => {
		agent = new PGAgent(platform, resolution.value)
		reset()
	})
	controller.input.button('Reset').on('click', reset)
	const learningRate = controller.input.number({
		label: ' Learning rate ',
		min: 0.01,
		max: 10,
		step: 0.01,
		value: 0.1,
	})
	slbConf
		.step(cb => {
			if (step()) {
				setTimeout(() => {
					reset()
					cb && setTimeout(cb, 10)
				})
			} else {
				cb && setTimeout(cb, 5)
			}
		})
		.skip(() => {
			if (step(false)) {
				reset()
			}
		})
	platform.plotRewards(controller.element)
}
