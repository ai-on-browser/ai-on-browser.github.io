import DQNAgent from '../../lib/model/dqn.js'

class DQNCBAgent {
	constructor(env, resolution, layers, optimizer, use_worker, cb) {
		this._agent = new DQNAgent(env, resolution, layers, optimizer)
		cb && cb()
	}

	set method(value) {
		this._agent.method = value
	}

	terminate() {}

	get_score(env, cb) {
		const score = this._agent.get_score(env)
		cb && cb(score)
	}

	get_action(env, state, greedy_rate = 0.002, cb) {
		const action = this._agent.get_action(env, state, greedy_rate)
		cb && cb(action)
	}

	update(action, state, next_state, reward, done, learning_rate, batch, cb) {
		this._agent.update(action, state, next_state, reward, done, learning_rate, batch)
		cb && cb()
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

	const use_worker = false
	let readyNet = false
	let agent = null
	let cur_state = env.reset(agent)

	const render_score = cb => {
		if (env.type === 'grid') {
			agent.get_score(env, score => {
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
		const greedy_rate = +elm.select('[name=greedy_rate]').property('value')
		const min_greedy_rate = +elm.select('[name=min_greedy_rate]').property('value')
		const greedy_rate_update = +elm.select('[name=greedy_rate_update]').property('value')
		const learning_rate = +elm.select('[name=learning_rate]').property('value')
		const batch = +elm.select('[name=batch]').property('value')
		agent.get_action(env, cur_state, Math.max(min_greedy_rate, greedy_rate * greedy_rate_update), action => {
			let [next_state, reward, done] = env.step(action, agent)
			agent.update(action, cur_state, next_state, reward, done, learning_rate, batch, () => {
				const end_proc = () => {
					cur_state = next_state
					if (done || env.epoch % 1000 === 999) {
						elm.select('[name=greedy_rate]').property('value', greedy_rate * greedy_rate_update)
					}
					cb && cb(done)
				}
				if (render) {
					render_score(end_proc)
				} else {
					end_proc()
				}
			})
		})
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
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'New agent')
		.on('click', () => {
			agent.terminate()
			agent = new DQNCBAgent(env, resolution, builder.layers, builder.optimizer, use_worker, () => {
				readyNet = true
				reset()
			})
			elm.select('[name=greedy_rate]').property('value', 1)
		})
	elm.append('input').attr('type', 'button').attr('value', 'Reset').on('click', reset)
	elm.append('select')
		.attr('name', 'method')
		.on('change', function () {
			const e = d3.select(this)
			agent.method = e.property('value')
		})
		.selectAll('option')
		.data(['DQN', 'DDQN'])
		.enter()
		.append('option')
		.property('value', d => d)
		.text(d => d)
	elm.append('span').text('greedy rate = max(')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'min_greedy_rate')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', '0.01')
		.attr('value', 0.01)
	elm.append('span').text(', ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'greedy_rate')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', '0.01')
		.attr('value', 1)
	elm.append('span').text(' * ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'greedy_rate_update')
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', '0.01')
		.attr('value', 0.995)
	elm.append('span').text(') ')
	elm.append('span').text(' Learning rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'learning_rate')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.01)
		.attr('value', 0.001)
	elm.append('span').text(' Batch size ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'batch')
		.attr('value', 10)
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 1)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => step())
	let isRunning = false
	const epochButton = elm
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Epoch')
		.on('click', () => {
			isRunning = !isRunning
			epochButton.attr('value', isRunning ? 'Stop' : 'Epoch')
			skipButton.property('disabled', isRunning)
			if (isRunning) {
				;(function loop() {
					if (isRunning) {
						step(done => {
							setTimeout(() => (done ? reset(loop) : loop()))
						})
					} else {
						setTimeout(() => {
							render_score(() => {
								epochButton.attr('value', 'Epoch')
							})
						}, 0)
					}
				})()
			}
		})
	const skipButton = elm
		.append('input')
		.attr('type', 'button')
		.attr('value', 'Skip')
		.on('click', () => {
			isRunning = !isRunning
			skipButton.attr('value', isRunning ? 'Stop' : 'Skip')
			epochButton.property('disabled', isRunning)
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
						skipButton.attr('value', 'Skip')
					})
				})()
			}
		})
	env.plotRewards(elm)

	elm.selectAll('input').property('disabled', true)

	return () => {
		isRunning = false
		agent.terminate()
	}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "step" to update.'
	platform.setting.terminate = dispDQN(platform.setting.ml.configElement, platform)
}
