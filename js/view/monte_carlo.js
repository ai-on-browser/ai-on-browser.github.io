import MCAgent from '../../lib/model/monte_carlo.js'
import Controller from '../controller.js'

var dispMC = function (elm, env) {
	const controller = new Controller(env)
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20

	let agent = new MCAgent(env, initResolution)
	let cur_state = env.reset(agent)
	env.render(() => agent.get_score())

	const step = (render = true) => {
		const greedy_rate = +elm.select('[name=greedy_rate]').property('value')
		const action = agent.get_action(cur_state, greedy_rate)
		const { state, reward, done } = env.step(action, agent)
		agent.update(action, cur_state, reward, done)
		if (render) {
			env.render()
		}
		cur_state = state
		return done
	}

	const reset = () => {
		cur_state = env.reset(agent)
		agent.reset()
		env.render(() => agent.get_score())
	}

	elm.append('span').text('Resolution')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'resolution')
		.attr('min', 2)
		.attr('max', 100)
		.attr('value', initResolution)
	const slbConf = controller.stepLoopButtons().init(() => {
		const resolution = +elm.select('[name=resolution]').property('value')
		agent = new MCAgent(env, resolution)
		reset()
	})
	elm.append('input').attr('type', 'button').attr('value', 'Reset').on('click', reset)
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'greedy_rate')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', '0.01')
		.attr('value', 0.5)
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
	env.plotRewards(elm)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	dispMC(platform.setting.ml.configElement, platform)
}
