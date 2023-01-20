export default class Controller {
	constructor(platform) {
		this._e = platform.setting.ml.configElement.node()
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
			elm.appendChild(document.createTextNode(conf.label))
		}
		const text = document.createElement('span')
		elm.appendChild(text)
		text.innerText = conf.value ?? ''
		return {
			element: text,
			get value() {
				return text.innerText
			},
			set value(value) {
				text.innerText = value
			},
		}
	}

	select(conf = {}) {
		if (Array.isArray(conf)) {
			conf = { values: conf }
		}
		const elm = this._e
		const { label, values, value, ...rest } = conf
		if (label) {
			elm.appendChild(document.createTextNode(label))
		}
		const select = document.createElement('select')
		elm.appendChild(select)
		for (const val of values) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = val
			select.appendChild(opt)
		}
		if (value) {
			select.value = value
		}
		for (const key of Object.keys(rest)) {
			if (rest[key] != null) {
				select.setAttribute(key, rest[key])
			}
		}
		return {
			element: select,
			get value() {
				return select.value
			},
			set value(value) {
				select.value = value
			},
			set values(values) {
				select.replaceChild()
				for (const value of values) {
					const opt = document.createElement('option')
					opt.value = value
					opt.innerText = value
					select.appendChild(opt)
				}
			},
			on(name, fn) {
				select.addEventListener(name, fn)
				return this
			},
		}
	}

	input({ label, type, ...rest }) {
		const elm = this._e
		if (label) {
			elm.appendChild(document.createTextNode(label))
		}
		const input = document.createElement('input')
		elm.appendChild(input)
		input.type = type
		for (const key of Object.keys(rest)) {
			if (rest[key] != null) {
				input.setAttribute(key, rest[key])
			}
		}
		return {
			element: input,
			get value() {
				if (type === 'number' || type === 'range') {
					return +input.value
				} else if (type === 'checkbox') {
					return input.checked
				}
				return input.value
			},
			set value(value) {
				input.value = value
			},
			on(name, fn) {
				input.addEventListener(name, fn)
				return this
			},
		}
	}

	array({ label, type, ...rest }) {
		const elm = this._e
		if (label) {
			elm.appendChild(document.createTextNode(label))
		}
		const arrelm = document.createElement('span')
		elm.appendChild(arrelm)
		const values = rest.values ?? []
		const items = []

		const createElms = () => {
			arrelm.replaceChildren()
			for (let i = 0; i < values.length; i++) {
				const itm = document.createElement('input')
				itm.type = type
				for (const key of Object.keys(rest)) {
					if (rest[key] != null) {
						itm.setAttribute(key, rest[key])
					}
				}
				itm.value = values[i]
				itm.onchange = () => {
					values[i] = itm.value
				}
				arrelm.appendChild(itm)
				items.push(itm)
			}
			if (values.length > 0) {
				const btn = document.createElement('input')
				btn.type = 'button'
				btn.value = '-'
				btn.onclick = () => {
					values.pop()
					createElms()
				}
				arrelm.appendChild(btn)
			}
		}
		const btn = document.createElement('input')
		btn.type = 'button'
		btn.value = '+'
		btn.onclick = () => {
			values.push(rest.default)
			createElms()
		}
		elm.appendChild(btn)
		createElms()
		return {
			element: arrelm,
			get value() {
				if (type === 'number' || type === 'range') {
					return values.map(v => +v)
				}
				return values
			},
			set value(value) {
				values.length = 0
				values.push(...value)
				createElms()
			},
			on(name, fn) {
				items.forEach(itm => itm.addEventListener(name, fn))
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
				stepButton && (stepButton.disabled = !value)
				runButton && (runButton.disabled = !value)
				skipButton && (skipButton.disabled = !value)
			},
			init(cb) {
				this.initialize = cb
				const initButton = document.createElement('input')
				initButton.type = 'button'
				initButton.value = 'Initialize'
				initButton.onclick = () => {
					if (cb.length > 0) {
						initButton.disabled = true
						this.enable = false
						cb(() => {
							initButton.disabled = false
							this.enable = true
							epochText && (epochText.innerText = count = 0)
						})
					} else {
						cb()
						this.enable = true
						epochText && (epochText.innerText = count = 0)
					}
				}
				elm.appendChild(initButton)
				existInit = true
				return this
			},
			step(cb) {
				stepButton = document.createElement('input')
				stepButton.type = 'button'
				stepButton.value = 'Step'
				stepButton.disabled = existInit
				stepButton.onclick = () => {
					if (cb.length > 0) {
						this.enable = false
						cb(() => {
							this.enable = true
							epochText && (epochText.innerText = count = epochCb())
						})
					} else {
						cb()
						epochText && (epochText.innerText = count = epochCb())
					}
				}
				elm.appendChild(stepButton)
				runButton = document.createElement('input')
				runButton.type = 'button'
				runButton.value = 'Run'
				runButton.disabled = existInit
				runButton.onclick = () => {
					isRunning = !isRunning
					runButton.value = isRunning ? 'Stop' : 'Run'
					if (isRunning) {
						const stepLoop = () => {
							if (isRunning) {
								if (cb.length > 0) {
									cb(() => {
										epochText && (epochText.innerText = count = epochCb())
										setTimeout(stepLoop, 0)
									})
								} else {
									cb()
									epochText && (epochText.innerText = count = epochCb())
									setTimeout(stepLoop, 0)
								}
							}
							stepButton.disabled = isRunning
							skipButton && (skipButton.disabled = isRunning)
							runButton.disabled = false
						}
						stepLoop()
					} else {
						runButton.disabled = true
					}
				}
				elm.appendChild(runButton)
				stepCb = cb
				return this
			},
			skip(cb) {
				cb ||= stepCb
				skipButton = document.createElement('input')
				skipButton.type = 'button'
				skipButton.value = 'Skip'
				skipButton.disabled = existInit
				skipButton.onclick = () => {
					isRunning = !isRunning
					skipButton.value = isRunning ? 'Stop' : 'Skip'
					if (isRunning) {
						let lastt = new Date().getTime()
						const stepLoop = () => {
							stepButton && (stepButton.disabled = isRunning)
							runButton && (runButton.disabled = isRunning)
							skipButton.disabled = false
							while (isRunning) {
								if (cb.length > 0) {
									cb(() => {
										epochText && (epochText.innerText = count = epochCb())
										setTimeout(stepLoop, 0)
									})
									return
								} else {
									cb()
									epochText && (epochText.innerText = count = epochCb())
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
						skipButton.disabled = true
					}
				}
				elm.appendChild(skipButton)
				return this
			},
			epoch(cb) {
				elm.appendChild(document.createTextNode(' Epoch: '))
				epochText = document.createElement('span')
				elm.appendChild(epochText)
				epochText.setAttribute('name', 'epoch')
				epochText.innerText = 0
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
