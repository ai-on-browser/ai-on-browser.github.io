import { DefaultPlatform } from './base.js'
import LinePlotter from '../renderer/util/lineplot.js'

export default class SemisupervisedPlatform extends DefaultPlatform {
	constructor(task, manager) {
		super(task, manager)

		const elm = this.setting.task.configElement
		const desctxt = document.createElement('div')
		desctxt.innerText = "Unlabeled data category is '0' (black)."
		elm.appendChild(desctxt)
		elm.appendChild(document.createTextNode('Unlabeled Rate'))
		const urate = document.createElement('input')
		urate.type = 'number'
		urate.min = 0
		urate.max = 1
		urate.step = 0.1
		urate.value = 0.9
		urate.name = 'unlabeled-rate'
		urate.onchange = () => {
			if (this.datas && this._original_classes) {
				for (let i = 0; i < this._original_classes.length; i++) {
					this.datas.y[i] = this._original_classes[i]
				}
			}
			this._original_classes = null
			this.init()
		}
		elm.appendChild(urate)
	}

	get trainInput() {
		return this.datas.x
	}

	get trainOutput() {
		return this.datas.y.map(p => [p])
	}

	set trainResult(value) {
		this._renderer.trainResult = value
		this._tablerenderer.trainResult = value
	}

	testInput(step = 10) {
		const tiles = this._renderer.testData(step)
		tiles.push(...this.datas.x)
		return tiles
	}

	testResult(pred) {
		const p = pred.slice(pred.length - this.datas.length)
		const t = this.datas.y
		pred = pred.slice(0, pred.length - this.datas.length)
		let acc = 0
		for (let i = 0; i < t.length; i++) {
			if (t[i] === p[i]) {
				acc++
			}
		}
		this._getEvaluateElm().innerText = 'Accuracy:' + acc / t.length
		this._tablerenderer.trainResult = p
		this._renderer.testResult(pred)
	}

	init() {
		this.setting.footer.innerText = ''

		const elm = this.setting.task.configElement
		const r = +elm.querySelector('[name=unlabeled-rate]').value
		if (r > 0 && !this._original_classes) {
			this._original_classes = this.datas.y.concat()
			const class_idx = {}
			for (let i = 0; i < this.datas.length; i++) {
				if (!class_idx[this._original_classes[i]]) {
					class_idx[this._original_classes[i]] = []
				}
				class_idx[this._original_classes[i]].push(i)
			}
			for (const k of Object.keys(class_idx)) {
				let c = Math.floor(class_idx[k].length * r)
				while (c > 0) {
					const idx = Math.floor(Math.random() * class_idx[k].length)
					this.datas.y[class_idx[k][idx]] = null
					class_idx[k].splice(idx, 1)
					c--
				}
			}
		}

		this._renderer.init()
		this._tablerenderer.init()
		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
			this.setting.footer.replaceChildren()
		}
	}

	render() {
		this._renderer.render()
		this._tablerenderer.render()
	}

	_getEvaluateElm() {
		if (this._loss) {
			const txt = this.setting.footer.querySelector('div.evaluate_result')
			if (!txt) {
				const eres = document.createElement('div')
				eres.classList.add('evaluate_result')
				this.setting.footer.insertBefore(eres, this.setting.footer.firstChild)
				return eres
			}
			return txt
		}
		return this.setting.footer
	}

	plotLoss(value) {
		if (!this._loss) {
			const orgText = this.setting.footer.innerText
			this.setting.footer.innerText = ''
			this._loss = new LinePlotter(this.setting.footer)
			this._getEvaluateElm().innerText = orgText
		}
		this._loss.add(value)
	}

	terminate() {
		if (this.datas && this._original_classes) {
			for (let i = 0; i < this._original_classes.length; i++) {
				this.datas.y[i] = this._original_classes[i]
			}
		}

		this.setting.task.configElement.replaceChildren()
		this.setting.footer.innerText = ''
		super.terminate()
	}
}
