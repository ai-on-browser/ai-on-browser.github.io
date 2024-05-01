import MCAgent from '../../lib/model/monte_carlo.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	const controller = new Controller(platform)
	const initResolution = platform.type === 'grid' ? Math.max(...platform.env.size) : 20

	let agent = new MCAgent(platform, initResolution)
	let cur_state = platform.reset(agent)
	platform.render(() => agent.get_score())

	const step = (render = true) => {
		const action = agent.get_action(cur_state, greedyRate.value)
		const { state, reward, done } = platform.step(action, agent)
		agent.update(action, cur_state, reward, done)
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
		agent = new MCAgent(platform, resolution.value)
		reset()
	})
	controller.input.button('Reset').on('click', reset)
	const greedyRate = controller.input.number({ min: 0, max: 1, step: 0.01, value: 0.5 })
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
