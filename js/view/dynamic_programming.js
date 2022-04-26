import DPAgent from '../../lib/model/dynamic_programming.js'
import Controller from '../controller.js'

export default function (env) {
	env.setting.ml.usage = 'Click "step" to update, click "move" to move agent.'
	const controller = new Controller(env)
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20

	let agent = new DPAgent(env, initResolution)
	let cur_state = env.reset(agent)
	env.render(() => agent.get_score())

	const update = () => {
		agent.update(type.value)
		env.render(() => agent.get_score())
	}

	const resolution = controller.input.number({
		label: 'Resolution',
		min: 2,
		max: 100,
		value: initResolution,
	})
	const slbConf = controller.stepLoopButtons().init(() => {
		agent = new DPAgent(env, resolution.value)
		cur_state = env.reset(agent)
		env.render(() => agent.get_score())
	})
	const type = controller.select(['value', 'policy'])
	slbConf.step(update).epoch()

	controller.input.button('Reset').on('click', () => {
		cur_state = env.reset(agent)
		env.render(() => agent.get_score())
	})
	let isMoving = false
	const moveButton = controller.input.button('Move').on('click', () => {
		isMoving = !isMoving
		moveButton.value = isMoving ? 'Stop' : 'Mode'
		;(function loop() {
			if (isMoving) {
				const action = agent.get_action(cur_state)
				const { state } = env.step(action, agent)
				env.render(() => agent.get_score())
				cur_state = state
				setTimeout(loop, 10)
			}
		})()
	})

	return () => {
		isMoving = false
	}
}
