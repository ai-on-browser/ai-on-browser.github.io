import A2CAgent from '../../lib/model/a2c.js'
import Controller from '../controller.js'
import NeuralNetworkBuilder from '../neuralnetwork_builder.js'

class A2CCBAgent {
	constructor(env, resolution, layers, optimizer) {
		this._agent = new A2CAgent(env.env, resolution, 50, layers, optimizer)
	}

	set method(value) {
		this._agent.method = value
	}

	terminate() {}

	get_score() {
		return this._agent.get_score()
	}

	get_action(state) {
		return this._agent.get_action(state)
	}

	update(done, learning_rate, batch) {
		return this._agent.update(done, learning_rate, batch)
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	const controller = new Controller(platform)
	let resolution = 20
	if (platform.type === 'grid') {
		platform.env._max_step = 1000
		resolution = Math.max(...platform.env.size)
	}
	const builder = new NeuralNetworkBuilder()

	let agent = null
	let cur_state = platform.reset(agent)

	const step = (cb, render = true) => {
		const action = agent.get_action(cur_state)
		const { state, done } = platform.step(action)
		const loss = agent.update(done, learning_rate.value, batch.value)
		platform.plotLoss(loss)
		const end_proc = () => {
			cur_state = state
			cb && cb(done)
		}
		if (render) {
			platform.render(() => agent.get_score())
		}
		end_proc()
	}

	const reset = cb => {
		cur_state = platform.reset(agent)
		platform.render(() => agent.get_score())
		cb && cb()
	}

	controller.text(' Hidden Layers ')
	builder.makeHtml(controller, { optimizer: true })
	agent = new A2CCBAgent(platform, resolution, builder.layers, builder.optimizer)
	setTimeout(() => {
		platform.render(() => agent.get_score())
		for (const elm of controller.element.querySelectorAll('input')) {
			elm.disabled = false
		}
	}, 0)
	controller.input.button('New agent').on('click', () => {
		agent.terminate()
		agent = new A2CCBAgent(platform, resolution, builder.layers, builder.optimizer)
		reset()
	})
	controller.input.button('Reset').on('click', () => reset())
	const learning_rate = controller.input.number({
		label: ' Learning rate ',
		min: 0,
		max: 100,
		step: 0.001,
		value: 0.001,
	})
	const batch = controller.input.number({ label: ' Batch size ', min: 1, max: 100, value: 10 })
	controller.input.button('Step').on('click', () => step())
	let isRunning = false
	const epochButton = controller.input.button('Epoch').on('click', () => {
		isRunning = !isRunning
		epochButton.value = isRunning ? 'Stop' : 'Epoch'
		skipButton.element.disabled = isRunning
		if (isRunning) {
			;(function loop() {
				if (isRunning) {
					step(done => {
						setTimeout(() => (done ? reset(loop) : loop()))
					})
				} else {
					setTimeout(() => {
						platform.render(() => agent.get_score())
						epochButton.value = 'Epoch'
					}, 0)
				}
			})()
		}
	})
	const skipButton = controller.input.button('Skip').on('click', () => {
		isRunning = !isRunning
		skipButton.value = isRunning ? 'Stop' : 'Skip'
		epochButton.element.disabled = isRunning
		if (isRunning) {
			let lastt = Date.now()
			;(function loop() {
				while (isRunning) {
					let dn = false
					step(done => {
						dn = done
					}, true)
					const curt = Date.now()
					if (dn) {
						reset()
					}
					if (curt - lastt > 200) {
						lastt = curt
						setTimeout(loop, 0)
						return
					}
				}
				platform.render(() => agent.get_score())
				skipButton.value = 'Skip'
			})()
		}
	})
	platform.plotRewards(controller.element)

	for (const elm of controller.element.querySelectorAll('input')) {
		elm.disabled = true
	}

	return () => {
		isRunning = false
		agent.terminate()
	}
}
