import NeuralNetworkBuilder from '../neuralnetwork_builder.js'
import DQNAgent from '../../lib/model/dqn.js'
import Controller from '../controller.js'

class DQNCBAgent {
	constructor(env, resolution, layers, optimizer, use_worker, cb) {
		this._agent = new DQNAgent(env, resolution, layers, optimizer)
		cb && cb()
	}

	set method(value) {
		this._agent.method = value
	}

	terminate() {}

	get_score(cb) {
		const score = this._agent.get_score()
		cb && cb(score)
	}

	get_action(state, greedy_rate = 0.002, cb) {
		const action = this._agent.get_action(state, greedy_rate)
		cb && cb(action)
	}

	update(action, state, next_state, reward, done, learning_rate, batch, cb) {
		const loss = this._agent.update(action, state, next_state, reward, done, learning_rate, batch)
		cb && cb(loss)
	}
}

var dispDQN = function (elm, env) {
	let resolution = 20
	if (env.type === 'grid') {
		env.env._reward = {
			step: -1,
			wall: -1,
			goal: 1,
			fail: -1,
		}
		env.env._max_step = 3000
		resolution = Math.max(...env.env.size)
	}
	const builder = new NeuralNetworkBuilder()
	const controller = new Controller(env)

	const use_worker = false
	let readyNet = false
	let agent = null
	let cur_state = env.reset(agent)

	const render_score = cb => {
		if (env.type === 'grid') {
			agent.get_score(score => {
				env.render(() => score)
				cb && cb()
			})
		} else {
			env.render()
			cb && cb()
		}
	}

	const step = (cb, render = true) => {
		if (!readyNet) {
			cb && cb()
			return
		}
		agent.get_action(
			cur_state,
			Math.max(minGreedyRate.value, greedyRate.value * greedyRateUpdate.value),
			action => {
				const { state, reward, done } = env.step(action, agent)
				agent.update(action, cur_state, state, reward, done, learningRate.value, batch.value, loss => {
					if (loss != null) {
						env.plotLoss(loss)
					}
					const end_proc = () => {
						cur_state = state
						if (done || env.epoch % 1000 === 999) {
							greedyRate.value = greedyRate.value * greedyRateUpdate.value
						}
						cb && cb(done)
					}
					if (render) {
						render_score(end_proc)
					} else {
						end_proc()
					}
				})
			}
		)
	}

	const reset = cb => {
		if (!readyNet) {
			cb && cb()
			return
		}
		cur_state = env.reset(agent)
		render_score(() => {
			cb && cb()
		})
	}

	elm.append('span').text(' Hidden Layers ')
	builder.makeHtml(elm, { optimizer: true })
	agent = new DQNCBAgent(env, resolution, builder.layers, builder.optimizer, use_worker, () => {
		readyNet = true
		setTimeout(() => {
			render_score(() => {
				elm.selectAll('input').property('disabled', false)
			})
		}, 0)
	})
	controller.input.button('New agent').on('click', () => {
		agent.terminate()
		agent = new DQNCBAgent(env, resolution, builder.layers, builder.optimizer, use_worker, () => {
			readyNet = true
			reset()
		})
		greedyRate.value = 1
	})
	controller.input.button('Reset').on('click', () => reset())
	const method = controller.select(['DQN', 'DDQN']).on('change', () => {
		agent.method = method.value
	})
	const minGreedyRate = controller.input.number({
		label: 'greedy rate = max(',
		min: 0,
		max: 1,
		step: 0.01,
		value: 0.01,
	})
	const greedyRate = controller.input.number({
		label: ', ',
		min: 0,
		max: 1,
		step: 0.01,
		value: 1,
	})
	const greedyRateUpdate = controller.input.number({
		label: ' * ',
		min: 0,
		max: 1,
		step: 0.01,
		value: 0.995,
	})
	controller.text(') ')
	const learningRate = controller.input.number({
		label: ' Learning rate ',
		min: 0,
		max: 100,
		step: 0.01,
		value: 0.001,
	})
	const batch = controller.input.number({
		label: ' Batch size ',
		min: 1,
		max: 100,
		value: 10,
	})
	controller.input.button('Step').on('click', () => step())
	let isRunning = false
	const epochButton = controller.input.button('Epoch').on('click', () => {
		isRunning = !isRunning
		epochButton.element.value = isRunning ? 'Stop' : 'Epoch'
		skipButton.element.disabled = isRunning
		if (isRunning) {
			;(function loop() {
				if (isRunning) {
					step(done => {
						setTimeout(() => (done ? reset(loop) : loop()))
					})
				} else {
					setTimeout(() => {
						render_score(() => {
							epochButton.element.value = 'Epoch'
						})
					}, 0)
				}
			})()
		}
	})
	epochButton.element.disabled = true
	const skipButton = controller.input.button('Skip').on('click', () => {
		isRunning = !isRunning
		skipButton.element.value = isRunning ? 'Stop' : 'Skip'
		epochButton.element.disabled = isRunning
		if (isRunning) {
			let lastt = new Date().getTime()
			;(function loop() {
				while (isRunning) {
					let dn = false
					step(done => {
						dn = done
						if (use_worker) {
							done ? reset(loop) : loop()
						}
					}, true)
					if (use_worker) {
						return
					}
					const curt = new Date().getTime()
					if (dn) {
						reset()
					}
					if (curt - lastt > 200) {
						lastt = curt
						setTimeout(loop, 0)
						return
					}
				}
				render_score(() => {
					skipButton.element.value = 'Skip'
				})
			})()
		}
	})
	skipButton.element.disabled = true
	env.plotRewards(elm)

	return () => {
		isRunning = false
		agent.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	platform.setting.terminate = dispDQN(platform.setting.ml.configElement, platform)
}
