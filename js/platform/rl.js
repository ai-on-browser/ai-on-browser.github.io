import { BasePlatform, LossPlotter } from './base.js'
import EmptyRLEnvironment from '../../lib/rl/base.js'

import GameManager from './game/base.js'
import RLRenderer from '../renderer/rl.js'

const LoadedRLEnvironmentClass = {}

const AIEnv = {
	MD: ['grid', 'cartpole', 'mountaincar', 'acrobot', 'pendulum', 'maze', 'waterball', 'breaker'],
	GM: ['reversi', 'draughts', 'gomoku'],
}

export default class RLPlatform extends BasePlatform {
	constructor(task, manager, cb) {
		super(task, manager)
		this._type = ''
		this._epoch = 0
		this._env = new EmptyRLEnvironment()
		this._game = null

		this._is_updated_reward = false
		this._cumulativeReward = 0
		this._rewardHistory = []

		this._renderer.terminate()
		this._renderer = new RLRenderer(manager)

		this._load_env().then(() => cb(this))

		const elm = this.setting.task.configElement
		elm.appendChild(document.createTextNode('Environment'))
		const envslct = document.createElement('select')
		envslct.name = 'env'
		envslct.onchange = () => {
			if (this._plotter) {
				this._plotter.terminate()
			}
			this.setting.rl.configElement.replaceChildren()

			this._type = envslct.value
			this.setting.vue.pushHistory()
			this._load_env().then(() => {
				this.setting.ml.refresh()
			})
		}
		envslct.appendChild(document.createElement('option'))
		for (const name of AIEnv[this.task]) {
			const opt = document.createElement('option')
			opt.value = name
			opt.innerText = name
			envslct.appendChild(opt)
		}
		elm.appendChild(envslct)

		this._infoelm = document.createElement('div')
		this._infoelm.style.color = 'red'
		elm.appendChild(this._infoelm)
	}

	get params() {
		return {
			env: this._type,
		}
	}

	set params(params) {
		if (params.env && this._type !== params.env) {
			this._type = params.env
			this._load_env().then(() => {
				const elm = this.setting.task.configElement.querySelector('[name=env]')
				if (elm) {
					elm.value = this._type
				}
			})
		}
	}

	get epoch() {
		return this._epoch
	}

	get actions() {
		return this._env.actions
	}

	get states() {
		return this._env.states
	}

	get type() {
		return this._type
	}

	get env() {
		return this._env
	}

	set reward(value) {
		this._env.reward = value
	}

	async _load_env() {
		if (this._env) {
			this._env.close()
		}
		if (LoadedRLEnvironmentClass[this.type]) {
			this._env = new LoadedRLEnvironmentClass[this.type](this.width, this.height)
			this.init()
		} else if (this.type !== '') {
			return import(`../../lib/rl/${this.type}.js`).then(m => {
				this._env = new m.default(this.width, this.height)
				LoadedRLEnvironmentClass[this.type] = m.default
				this.init()
			})
		} else {
			this._env = new EmptyRLEnvironment()
		}
	}

	cumulativeReward(agent) {
		return this._cumulativeReward
	}

	rewardHistory(agent) {
		return this._rewardHistory
	}

	init() {
		if (this._game) {
			this._game.terminate()
			this._game = null
		}
		if (this._task === 'GM' && this._type !== '') {
			this._game = new GameManager(this)
		}
		this._infoelm.innerText = ''
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
		}

		this._renderer.init()
	}

	reset(...agents) {
		this._epoch = 0
		if (this._agents && this._agents.some((a, i) => a !== agents[i])) {
			this._is_updated_reward = false
			this._rewardHistory = []
			if (this._loss) {
				this._loss.terminate()
				this._loss = null
			}
		}
		if (this._game && this._manager._modelname !== '') {
			this._game.terminate()
			this._game = null
		} else if (!this._game && this._manager._modelname === '') {
			this._game = new GameManager(this)
		}
		if (this._task === 'GM' && this._manager._modelname !== '' && this._type !== 'reversi' && this._type !== '') {
			this._infoelm.innerText = 'Currently, only the reversi environment is available as a learning environment.'
		} else {
			this._infoelm.innerText = ''
		}
		this._agents = agents

		if (this._is_updated_reward) {
			this._rewardHistory.push(this._cumulativeReward)
		}
		this._is_updated_reward = false
		this._cumulativeReward = 0
		if (this._plotter) {
			this._plotter.printEpisode()
			this._plotter.printStep()
			this._plotter.plotRewards()
		}

		return this._env.reset()
	}

	render(best_action) {
		this._renderer.render(best_action)
	}

	terminate() {
		this._plotter?.terminate()
		this._game?.terminate()
		this.setting.rl.configElement.replaceChildren()
		this.setting.task.configElement.replaceChildren()
		this._env.close()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
		}
		super.terminate()
	}

	state(agent) {
		return this._env.state(agent)
	}

	step(action, agent) {
		this._epoch++
		const stepInfo = this._env.step(action, agent)
		this._is_updated_reward = true
		this._cumulativeReward += stepInfo.reward
		if (this._plotter) {
			this._plotter.printEpisode()
			this._plotter.printStep()
			this._plotter.plotRewards()
		}
		return stepInfo
	}

	test(state, action, agent) {
		return this._env.test(state, action, agent)
	}

	sample_action(agent) {
		return this._env.sample_action(agent)
	}

	plotRewards(r) {
		this._plotter = new RewardPlotter(this, r)
		this._plotter.printEpisode()
		this._plotter.printStep()
		this._plotter.plotRewards()
	}

	plotLoss(value) {
		if (!this._loss) {
			this._loss = new LossPlotter(this, this.setting.footer)
		}
		this._loss.add(value)
	}
}

class RewardPlotter {
	constructor(platform, r) {
		this._platform = platform
		this._r = r.select('span.reward_plotarea')
		if (this._r.size() === 0) {
			this._r = r.append('span').classed('reward_plotarea', true)
		}
		this._r.style('white-space', 'nowrap')

		this._plot_rewards_count = 1000
		this._print_rewards_count = 10
		this._plot_smooth_window = 20
	}

	terminate() {
		this._r.remove()
	}

	lastHistory(length = 0) {
		if (length <= 0) {
			return this._platform._rewardHistory
		}
		const historyLength = this._platform._rewardHistory.length
		return this._platform._rewardHistory.slice(Math.max(0, historyLength - length), historyLength)
	}

	printEpisode() {
		let span = this._r.select('span[name=episode]')
		if (span.size() === 0) {
			span = this._r.append('span').attr('name', 'episode')
		}
		span.text(' Episode: ' + (this.lastHistory().length + 1))
	}

	printStep() {
		let span = this._r.select('span[name=step]')
		if (span.size() === 0) {
			span = this._r.append('span').attr('name', 'step')
		}
		span.text(' Step: ' + this._platform.epoch)
	}

	plotRewards() {
		const width = 200
		const height = 50
		let svg = this._r.select('svg')
		let path = null
		let sm_path = null
		let mintxt = null
		let maxtxt = null
		let avetxt = null
		if (svg.size() === 0) {
			svg = this._r
				.append('svg')
				.attr('width', width + 200)
				.attr('height', height)
			path = svg.append('path').attr('name', 'value').attr('stroke', 'black').attr('fill-opacity', 0)
			sm_path = svg.append('path').attr('name', 'smooth').attr('stroke', 'green').attr('fill-opacity', 0)
			mintxt = svg
				.append('text')
				.classed('mintxt', true)
				.attr('x', width)
				.attr('y', height)
				.attr('fill', 'red')
				.attr('font-weight', 'bold')
			maxtxt = svg
				.append('text')
				.classed('maxtxt', true)
				.attr('x', width)
				.attr('y', 12)
				.attr('fill', 'red')
				.attr('font-weight', 'bold')
			avetxt = svg
				.append('text')
				.classed('avetxt', true)
				.attr('x', width)
				.attr('y', 24)
				.attr('fill', 'blue')
				.attr('font-weight', 'bold')
		} else {
			path = svg.select('path[name=value]')
			sm_path = svg.select('path[name=smooth]')
			mintxt = svg.select('text.mintxt')
			maxtxt = svg.select('text.maxtxt')
			avetxt = svg.select('text.avetxt')
		}

		const lastHistory = this.lastHistory(this._plot_rewards_count)
		if (lastHistory.length === 0) {
			svg.style('display', 'none')
			path.attr('d', null)
			sm_path.attr('d', null)
			return
		} else {
			svg.style('display', null)
		}
		const maxr = Math.max(...lastHistory)
		const minr = Math.min(...lastHistory)
		mintxt.text(`Min: ${minr}`)
		maxtxt.text(`Max: ${maxr}`)
		avetxt.text(`Mean: ${lastHistory.reduce((s, v) => s + v, 0) / lastHistory.length}`)
		if (maxr === minr) return

		const pp = (i, v) => [(width * i) / (lastHistory.length - 1), (1 - (v - minr) / (maxr - minr)) * height]

		const p = lastHistory.map((v, i) => pp(i, v))
		const line = d3
			.line()
			.x(d => d[0])
			.y(d => d[1])
		path.attr('d', line(p))

		const smp = []
		for (let i = 0; i < lastHistory.length - this._plot_smooth_window; i++) {
			let s = 0
			for (let k = 0; k < this._plot_smooth_window; k++) {
				s += lastHistory[i + k]
			}
			smp.push(pp(i + this._plot_smooth_window, s / this._plot_smooth_window))
		}
		sm_path.attr('d', line(smp))
	}

	printRewards() {
		let span = this._r.select('span[name=reward]')
		if (span.size() === 0) {
			span = this._r.append('span').attr('name', 'reward')
		}
		span.text(' [' + this.lastHistory(this._print_rewards_count).reverse().join(',') + ']')
	}
}
