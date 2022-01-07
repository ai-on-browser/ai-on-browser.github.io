import DPAgent from '../../lib/model/dynamic_programming.js'

var dispDP = function (elm, env) {
	const initResolution = env.type === 'grid' ? Math.max(...env.env.size) : 20

	let agent = new DPAgent(env, initResolution)
	let cur_state = env.reset(agent)
	env.render(() => agent.get_score())

	const update = () => {
		const method = elm.select('[name=type]').property('value')
		agent.update(method)
		env.render(() => agent.get_score())
	}

	elm.append('span').text('Resolution')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'resolution')
		.attr('min', 2)
		.attr('max', 100)
		.attr('value', initResolution)
	const slbConf = env.setting.ml.controller.stepLoopButtons().init(() => {
		const resolution = +elm.select('[name=resolution]').property('value')
		agent = new DPAgent(env, resolution)
		cur_state = env.reset(agent)
		env.render(() => agent.get_score())
	})
	elm.append('select')
		.attr('name', 'type')
		.selectAll('option')
		.data(['value', 'policy'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	slbConf.step(update).epoch()

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Reset')
		.on('click', () => {
			cur_state = env.reset(agent)
			env.render(() => agent.get_score())
		})
	let isMoving = false
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Move')
		.on('click', function () {
			isMoving = !isMoving
			const moveButton = d3.select(this)
			moveButton.attr('value', isMoving ? 'Stop' : 'Mode')
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

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update, click "move" to move agent.'
	platform.setting.terminate = dispDP(platform.setting.ml.configElement, platform)
}
