export default class Controller {
	constructor(platform) {
		this._e = platform.setting.ml.configElement
		this._terminators = []

		platform.setting.terminate = this.terminate.bind(this)

		this.input.text = conf => {
			return this.input({ type: 'text', ...conf })
		}
		this.input.number = conf => {
			return this.input({ type: 'number', ...conf })
		}
		this.input.range = conf => {
			return this.input({ type: 'range', ...conf })
		}
		this.input.button = conf => {
			if (typeof conf === 'string') {
				conf = { value: conf }
			}
			return this.input({ type: 'button', ...conf })
		}
	}

	terminate() {
		this._terminators.forEach(t => t())
	}

	text(conf = {}) {
		if (typeof conf === 'string') {
			conf = { value: conf }
		}
		const elm = this._e
		if (conf.label) {
			elm.append('span').text(conf.label)
		}
		const text = elm.append('span').text(conf.value)
		return {
			element: text,
			get value() {
				return text.text()
			},
			set value(value) {
				text.text(value)
			},
		}
	}

	select(conf = {}) {
		if (Array.isArray(conf)) {
			conf = { values: conf }
		}
		const elm = this._e
		if (conf.label) {
			elm.append('span').text(conf.label)
		}
		const select = elm.append('select')
		select
			.selectAll('option')
			.data(conf.values)
			.enter()
			.append('option')
			.property('value', d => d)
			.text(d => d)
		if (conf.value != null) {
			select.property('value', conf.value)
		}
		return {
			element: select,
			get value() {
				return select.property('value')
			},
			set value(value) {
				select.property('value', value)
			},
			set values(values) {
				select.selectAll('*').remove()
				select
					.selectAll('option')
					.data(values)
					.enter()
					.append('option')
					.attr('value', d => d)
					.text(d => d)
			},
			on(name, fn) {
				select.on(name, fn)
				return this
			},
		}
	}

	input({ label, type, ...rest }) {
		const elm = this._e
		if (label) {
			elm.append('span').text(label)
		}
		const input = elm.append('input').attr('type', type)
		for (const key of Object.keys(rest)) {
			if (rest[key] != null) {
				input.attr(key, rest[key])
			}
		}
		return {
			element: input,
			get value() {
				if (type === 'number' || type === 'range') {
					return +input.property('value')
				}
				return input.property('value')
			},
			set value(value) {
				input.property('value', value)
			},
			on(name, fn) {
				input.on(name, fn)
				return this
			},
		}
	}

	stepLoopButtons() {
		let count = 0
		const elm = this._e
		let isRunning = false
		let stepButton = null
		let runButton = null
		let skipButton = null
		let epochText = null
		let epochCb = () => count + 1
		let existInit = false
		let stepCb = null
		const loopButtons = {
			initialize: null,
			stop: () => (isRunning = false),
			set enable(value) {
				stepButton?.property('disabled', !value)
				runButton?.property('disabled', !value)
				skipButton?.property('disabled', !value)
			},
			init(cb) {
				this.initialize = cb
				const initButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Initialize')
					.on('click', () => {
						if (cb.length > 0) {
							initButton.property('disabled', true)
							this.enable = false
							cb(() => {
								initButton.property('disabled', false)
								this.enable = true
								epochText?.text((count = 0))
							})
						} else {
							cb()
							this.enable = true
							epochText?.text((count = 0))
						}
					})
				existInit = true
				return this
			},
			step(cb) {
				stepButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Step')
					.property('disabled', existInit)
					.on('click', () => {
						if (cb.length > 0) {
							this.enable = false
							cb(() => {
								this.enable = true
								epochText?.text((count = epochCb()))
							})
						} else {
							cb()
							epochText?.text((count = epochCb()))
						}
					})
				runButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Run')
					.property('disabled', existInit)
					.on('click', () => {
						isRunning = !isRunning
						runButton.attr('value', isRunning ? 'Stop' : 'Run')
						if (isRunning) {
							const stepLoop = () => {
								if (isRunning) {
									if (cb.length > 0) {
										cb(() => {
											epochText?.text((count = epochCb()))
											setTimeout(stepLoop, 0)
										})
									} else {
										cb()
										epochText?.text((count = epochCb()))
										setTimeout(stepLoop, 0)
									}
								}
								stepButton.property('disabled', isRunning)
								skipButton?.property('disabled', isRunning)
								runButton.property('disabled', false)
							}
							stepLoop()
						} else {
							runButton.property('disabled', true)
						}
					})
				stepCb = cb
				return this
			},
			skip(cb) {
				cb ||= stepCb
				skipButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Skip')
					.property('disabled', existInit)
					.on('click', () => {
						isRunning = !isRunning
						skipButton.attr('value', isRunning ? 'Stop' : 'Skip')
						if (isRunning) {
							let lastt = new Date().getTime()
							const stepLoop = () => {
								stepButton?.property('disabled', isRunning)
								runButton?.property('disabled', isRunning)
								skipButton.property('disabled', false)
								while (isRunning) {
									if (cb.length > 0) {
										cb(() => {
											epochText?.text((count = epochCb()))
											setTimeout(stepLoop, 0)
										})
										return
									} else {
										cb()
										epochText?.text((count = epochCb()))
										const curt = new Date().getTime()
										if (curt - lastt > 200) {
											lastt = curt
											setTimeout(stepLoop, 0)
											return
										}
									}
								}
							}
							stepLoop()
						} else {
							skipButton.property('disabled', true)
						}
					})
				return this
			},
			epoch(cb) {
				elm.append('span').text(' Epoch: ')
				epochText = elm.append('span').attr('name', 'epoch').text('0')
				if (cb) {
					epochCb = cb
				}
				return this
			},
			elm(cb) {
				cb(elm)
				return this
			},
		}
		this._terminators.push(loopButtons.stop)
		return loopButtons
	}
}
