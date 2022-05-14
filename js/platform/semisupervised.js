import { DefaultPlatform, LossPlotter } from './base.js'
import { getCategoryColor, DataCircle } from '../utils.js'

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
					this.datas.at(i).y = this._original_classes[i]
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
		this._r_task.selectAll('*').remove()

		value.forEach((v, i) => {
			const o = new DataCircle(this._r_task, this._renderer.points[i])
			o.color = getCategoryColor(v)
		})
	}

	testInput(step = 10) {
		const [tiles, plot] = this._renderer.predict(step)
		if (this._task === 'SC') {
			tiles.push(...this.datas.x)
		}
		this.__plot = plot
		return tiles
	}

	testResult(pred) {
		if (this._task === 'SC') {
			const p = pred.slice(pred.length - this.datas.length)
			const t = this.datas.y
			pred = pred.slice(0, pred.length - this.datas.length)
			if (this._task === 'SC') {
				let acc = 0
				for (let i = 0; i < t.length; i++) {
					if (t[i] === p[i]) {
						acc++
					}
				}
				this._getEvaluateElm().innerText = 'Accuracy:' + acc / t.length
			}
		}
		this.__plot(pred, this._r_tile)
	}

	init() {
		this._r?.remove()
		this._r = this.svg.insert('g', ':first-child').classed('default-render', true)
		this._r_task = this._r.append('g').classed('tasked-render', true)
		this._r_tile = this._r.append('g').classed('tile-render', true).attr('opacity', 0.5)
		this.setting.footer.innerText = ''
		this.svg.select('g.centroids').remove()

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
					this.datas.at(class_idx[k][idx]).y = null
					class_idx[k].splice(idx, 1)
					c--
				}
			}
		}

		this.render()
		if (this._loss) {
			this._loss.terminate()
			this._loss = null
			this.setting.footer.replaceChildren()
		}
	}

	render() {
		this._renderer.render()
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
			this._loss = new LossPlotter(this, this.setting.footer)
			this._getEvaluateElm().innerText = orgText
		}
		this._loss.add(value)
	}

	terminate() {
		if (this.datas && this._original_classes) {
			for (let i = 0; i < this._original_classes.length; i++) {
				this.datas.at(i).y = this._original_classes[i]
			}
		}

		this._r?.remove()
		this.svg.select('g.centroids').remove()
		this.svg.selectAll('g').style('visibility', null)
		this.setting.task.configElement.replaceChildren()
		this.setting.footer.innerText = ''
		super.terminate()
	}
}
