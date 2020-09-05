import { BaseData } from './base.js'

// http://archive.ics.uci.edu/ml/datasets/Iris
const dataNames = [
	'sepal length (cm)',
	'sepal width (cm)',
	'petal length (cm)',
	'petal width (cm)',
	'class'
]
const originalData = [
	[5.1, 3.5, 1.4, 0.2, 'Iris-setosa'],
	[4.9, 3.0, 1.4, 0.2, 'Iris-setosa'],
	[4.7, 3.2, 1.3, 0.2, 'Iris-setosa'],
	[4.6, 3.1, 1.5, 0.2, 'Iris-setosa'],
	[5.0, 3.6, 1.4, 0.2, 'Iris-setosa'],
	[5.4, 3.9, 1.7, 0.4, 'Iris-setosa'],
	[4.6, 3.4, 1.4, 0.3, 'Iris-setosa'],
	[5.0, 3.4, 1.5, 0.2, 'Iris-setosa'],
	[4.4, 2.9, 1.4, 0.2, 'Iris-setosa'],
	[4.9, 3.1, 1.5, 0.1, 'Iris-setosa'],
	[5.4, 3.7, 1.5, 0.2, 'Iris-setosa'],
	[4.8, 3.4, 1.6, 0.2, 'Iris-setosa'],
	[4.8, 3.0, 1.4, 0.1, 'Iris-setosa'],
	[4.3, 3.0, 1.1, 0.1, 'Iris-setosa'],
	[5.8, 4.0, 1.2, 0.2, 'Iris-setosa'],
	[5.7, 4.4, 1.5, 0.4, 'Iris-setosa'],
	[5.4, 3.9, 1.3, 0.4, 'Iris-setosa'],
	[5.1, 3.5, 1.4, 0.3, 'Iris-setosa'],
	[5.7, 3.8, 1.7, 0.3, 'Iris-setosa'],
	[5.1, 3.8, 1.5, 0.3, 'Iris-setosa'],
	[5.4, 3.4, 1.7, 0.2, 'Iris-setosa'],
	[5.1, 3.7, 1.5, 0.4, 'Iris-setosa'],
	[4.6, 3.6, 1.0, 0.2, 'Iris-setosa'],
	[5.1, 3.3, 1.7, 0.5, 'Iris-setosa'],
	[4.8, 3.4, 1.9, 0.2, 'Iris-setosa'],
	[5.0, 3.0, 1.6, 0.2, 'Iris-setosa'],
	[5.0, 3.4, 1.6, 0.4, 'Iris-setosa'],
	[5.2, 3.5, 1.5, 0.2, 'Iris-setosa'],
	[5.2, 3.4, 1.4, 0.2, 'Iris-setosa'],
	[4.7, 3.2, 1.6, 0.2, 'Iris-setosa'],
	[4.8, 3.1, 1.6, 0.2, 'Iris-setosa'],
	[5.4, 3.4, 1.5, 0.4, 'Iris-setosa'],
	[5.2, 4.1, 1.5, 0.1, 'Iris-setosa'],
	[5.5, 4.2, 1.4, 0.2, 'Iris-setosa'],
	[4.9, 3.1, 1.5, 0.1, 'Iris-setosa'],
	[5.0, 3.2, 1.2, 0.2, 'Iris-setosa'],
	[5.5, 3.5, 1.3, 0.2, 'Iris-setosa'],
	[4.9, 3.1, 1.5, 0.1, 'Iris-setosa'],
	[4.4, 3.0, 1.3, 0.2, 'Iris-setosa'],
	[5.1, 3.4, 1.5, 0.2, 'Iris-setosa'],
	[5.0, 3.5, 1.3, 0.3, 'Iris-setosa'],
	[4.5, 2.3, 1.3, 0.3, 'Iris-setosa'],
	[4.4, 3.2, 1.3, 0.2, 'Iris-setosa'],
	[5.0, 3.5, 1.6, 0.6, 'Iris-setosa'],
	[5.1, 3.8, 1.9, 0.4, 'Iris-setosa'],
	[4.8, 3.0, 1.4, 0.3, 'Iris-setosa'],
	[5.1, 3.8, 1.6, 0.2, 'Iris-setosa'],
	[4.6, 3.2, 1.4, 0.2, 'Iris-setosa'],
	[5.3, 3.7, 1.5, 0.2, 'Iris-setosa'],
	[5.0, 3.3, 1.4, 0.2, 'Iris-setosa'],
	[7.0, 3.2, 4.7, 1.4, 'Iris-versicolor'],
	[6.4, 3.2, 4.5, 1.5, 'Iris-versicolor'],
	[6.9, 3.1, 4.9, 1.5, 'Iris-versicolor'],
	[5.5, 2.3, 4.0, 1.3, 'Iris-versicolor'],
	[6.5, 2.8, 4.6, 1.5, 'Iris-versicolor'],
	[5.7, 2.8, 4.5, 1.3, 'Iris-versicolor'],
	[6.3, 3.3, 4.7, 1.6, 'Iris-versicolor'],
	[4.9, 2.4, 3.3, 1.0, 'Iris-versicolor'],
	[6.6, 2.9, 4.6, 1.3, 'Iris-versicolor'],
	[5.2, 2.7, 3.9, 1.4, 'Iris-versicolor'],
	[5.0, 2.0, 3.5, 1.0, 'Iris-versicolor'],
	[5.9, 3.0, 4.2, 1.5, 'Iris-versicolor'],
	[6.0, 2.2, 4.0, 1.0, 'Iris-versicolor'],
	[6.1, 2.9, 4.7, 1.4, 'Iris-versicolor'],
	[5.6, 2.9, 3.6, 1.3, 'Iris-versicolor'],
	[6.7, 3.1, 4.4, 1.4, 'Iris-versicolor'],
	[5.6, 3.0, 4.5, 1.5, 'Iris-versicolor'],
	[5.8, 2.7, 4.1, 1.0, 'Iris-versicolor'],
	[6.2, 2.2, 4.5, 1.5, 'Iris-versicolor'],
	[5.6, 2.5, 3.9, 1.1, 'Iris-versicolor'],
	[5.9, 3.2, 4.8, 1.8, 'Iris-versicolor'],
	[6.1, 2.8, 4.0, 1.3, 'Iris-versicolor'],
	[6.3, 2.5, 4.9, 1.5, 'Iris-versicolor'],
	[6.1, 2.8, 4.7, 1.2, 'Iris-versicolor'],
	[6.4, 2.9, 4.3, 1.3, 'Iris-versicolor'],
	[6.6, 3.0, 4.4, 1.4, 'Iris-versicolor'],
	[6.8, 2.8, 4.8, 1.4, 'Iris-versicolor'],
	[6.7, 3.0, 5.0, 1.7, 'Iris-versicolor'],
	[6.0, 2.9, 4.5, 1.5, 'Iris-versicolor'],
	[5.7, 2.6, 3.5, 1.0, 'Iris-versicolor'],
	[5.5, 2.4, 3.8, 1.1, 'Iris-versicolor'],
	[5.5, 2.4, 3.7, 1.0, 'Iris-versicolor'],
	[5.8, 2.7, 3.9, 1.2, 'Iris-versicolor'],
	[6.0, 2.7, 5.1, 1.6, 'Iris-versicolor'],
	[5.4, 3.0, 4.5, 1.5, 'Iris-versicolor'],
	[6.0, 3.4, 4.5, 1.6, 'Iris-versicolor'],
	[6.7, 3.1, 4.7, 1.5, 'Iris-versicolor'],
	[6.3, 2.3, 4.4, 1.3, 'Iris-versicolor'],
	[5.6, 3.0, 4.1, 1.3, 'Iris-versicolor'],
	[5.5, 2.5, 4.0, 1.3, 'Iris-versicolor'],
	[5.5, 2.6, 4.4, 1.2, 'Iris-versicolor'],
	[6.1, 3.0, 4.6, 1.4, 'Iris-versicolor'],
	[5.8, 2.6, 4.0, 1.2, 'Iris-versicolor'],
	[5.0, 2.3, 3.3, 1.0, 'Iris-versicolor'],
	[5.6, 2.7, 4.2, 1.3, 'Iris-versicolor'],
	[5.7, 3.0, 4.2, 1.2, 'Iris-versicolor'],
	[5.7, 2.9, 4.2, 1.3, 'Iris-versicolor'],
	[6.2, 2.9, 4.3, 1.3, 'Iris-versicolor'],
	[5.1, 2.5, 3.0, 1.1, 'Iris-versicolor'],
	[5.7, 2.8, 4.1, 1.3, 'Iris-versicolor'],
	[6.3, 3.3, 6.0, 2.5, 'Iris-virginica'],
	[5.8, 2.7, 5.1, 1.9, 'Iris-virginica'],
	[7.1, 3.0, 5.9, 2.1, 'Iris-virginica'],
	[6.3, 2.9, 5.6, 1.8, 'Iris-virginica'],
	[6.5, 3.0, 5.8, 2.2, 'Iris-virginica'],
	[7.6, 3.0, 6.6, 2.1, 'Iris-virginica'],
	[4.9, 2.5, 4.5, 1.7, 'Iris-virginica'],
	[7.3, 2.9, 6.3, 1.8, 'Iris-virginica'],
	[6.7, 2.5, 5.8, 1.8, 'Iris-virginica'],
	[7.2, 3.6, 6.1, 2.5, 'Iris-virginica'],
	[6.5, 3.2, 5.1, 2.0, 'Iris-virginica'],
	[6.4, 2.7, 5.3, 1.9, 'Iris-virginica'],
	[6.8, 3.0, 5.5, 2.1, 'Iris-virginica'],
	[5.7, 2.5, 5.0, 2.0, 'Iris-virginica'],
	[5.8, 2.8, 5.1, 2.4, 'Iris-virginica'],
	[6.4, 3.2, 5.3, 2.3, 'Iris-virginica'],
	[6.5, 3.0, 5.5, 1.8, 'Iris-virginica'],
	[7.7, 3.8, 6.7, 2.2, 'Iris-virginica'],
	[7.7, 2.6, 6.9, 2.3, 'Iris-virginica'],
	[6.0, 2.2, 5.0, 1.5, 'Iris-virginica'],
	[6.9, 3.2, 5.7, 2.3, 'Iris-virginica'],
	[5.6, 2.8, 4.9, 2.0, 'Iris-virginica'],
	[7.7, 2.8, 6.7, 2.0, 'Iris-virginica'],
	[6.3, 2.7, 4.9, 1.8, 'Iris-virginica'],
	[6.7, 3.3, 5.7, 2.1, 'Iris-virginica'],
	[7.2, 3.2, 6.0, 1.8, 'Iris-virginica'],
	[6.2, 2.8, 4.8, 1.8, 'Iris-virginica'],
	[6.1, 3.0, 4.9, 1.8, 'Iris-virginica'],
	[6.4, 2.8, 5.6, 2.1, 'Iris-virginica'],
	[7.2, 3.0, 5.8, 1.6, 'Iris-virginica'],
	[7.4, 2.8, 6.1, 1.9, 'Iris-virginica'],
	[7.9, 3.8, 6.4, 2.0, 'Iris-virginica'],
	[6.4, 2.8, 5.6, 2.2, 'Iris-virginica'],
	[6.3, 2.8, 5.1, 1.5, 'Iris-virginica'],
	[6.1, 2.6, 5.6, 1.4, 'Iris-virginica'],
	[7.7, 3.0, 6.1, 2.3, 'Iris-virginica'],
	[6.3, 3.4, 5.6, 2.4, 'Iris-virginica'],
	[6.4, 3.1, 5.5, 1.8, 'Iris-virginica'],
	[6.0, 3.0, 4.8, 1.8, 'Iris-virginica'],
	[6.9, 3.1, 5.4, 2.1, 'Iris-virginica'],
	[6.7, 3.1, 5.6, 2.4, 'Iris-virginica'],
	[6.9, 3.1, 5.1, 2.3, 'Iris-virginica'],
	[5.8, 2.7, 5.1, 1.9, 'Iris-virginica'],
	[6.8, 3.2, 5.9, 2.3, 'Iris-virginica'],
	[6.7, 3.3, 5.7, 2.5, 'Iris-virginica'],
	[6.7, 3.0, 5.2, 2.3, 'Iris-virginica'],
	[6.3, 2.5, 5.0, 1.9, 'Iris-virginica'],
	[6.5, 3.0, 5.2, 2.0, 'Iris-virginica'],
	[6.2, 3.4, 5.4, 2.3, 'Iris-virginica'],
	[5.9, 3.0, 5.1, 1.8, 'Iris-virginica']
]

export default class IrisData extends BaseData {
	constructor(setting, r) {
		super(setting, r)

		const n = originalData.length
		this._classNames = [...new Set(originalData.map(d => d[4]))]
		this._x = []
		this._y = []
		for (let i = 0; i < n; i++) {
			this._x.push(originalData[i].slice(0, 4))
			let k = this._classNames.indexOf(originalData[i][4])
			this._y.push(k + 1)
		}
		this._scale = 110

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach(p => p.title = "")
			}
		})
		this._observer.observe(setting.svg.node(), {
			childList: true
		})

		this._init()
	}

	_init() {
		this._p = []
		const elm = this._setting.data.configElement.append("table")
			.style("border-collapse", "collapse")
			.style("margin-left", "1em")
		let row = elm.append("tr")
		row.append("td")
		row.append("td").text("D1")
		row.append("td").text("D2")
		this._ck1 = []
		this._ck2 = []
		for (let i = 0; i < 4; i++) {
			row = elm.append("tr")
			elm.append("td").text(dataNames[i])
			const d1 = elm.append("td")
				.append("input")
				.attr("type", "radio")
				.attr("name", "iris-d1")
				.on("change", () => this._plot_data())
			this._ck1.push(d1)
			const d2 = elm.append("td")
				.append("input")
				.attr("type", "radio")
				.attr("name", "iris-d2")
				.on("change", () => this._plot_data())
			this._ck2.push(d2)
		}
		this._ck1[0].property("checked", true)
		this._ck2[1].property("checked", true)
		this._plot_data()
	}

	get availTask() {
		return ['CF', 'RG', 'AD', 'DR']
	}

	get domain() {
		return [
			[0, 10],
			[0, 10],
			[0, 10],
			[0, 10],
		]
	}

	_plot_data() {
		const k = []
		for (let i = 0; i < this._ck1.length; i++) {
			if (this._ck1[i].property("checked")) {
				k[0] = i
			}
			if (this._ck2[i].property("checked")) {
				k[1] = i
			}
		}
		const n = originalData.length
		const v = this._x.map(x => [x[k[0]], x[k[1]]])
		const min = v.reduce((s, p) => [Math.min(s[0], p[0]), Math.min(s[1], p[1])], [Infinity, Infinity])
		for (let i = 0; i < n; i++) {
			const d = [(v[i][0] - min[0] + 0.1) * this._scale, (v[i][1] - min[1] + 0.1) * this._scale]
			if (this._p[i]) {
				this._p[i].at = d
			} else {
				this._p[i] = new DataPoint(this._r, d, this._y[i])
			}
		}
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = [v[0]]
				}
			},
			y: {
				get: () => this._y[i],
				set: v => {
					this._p[i].category = v
				}
			},
			point: {
				get: () => this._p[i]
			}
		})
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step];
		}
		const tiles = this._x.map(x => x.concat());
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			const t = r.append("g").attr("opacity", 0.5)
			const name = pred.every(p => Number.isInteger(p))
			for (let i = 0; i < pred.length; i++) {
				const o = new DataCircle(t, this._p[i])
				o.color = getCategoryColor(pred[i]);
				if (name) {
					this._p[i].title = `true: ${this._classNames[this._y[i] - 1]}\npred: ${this._classNames[pred[i] - 1]}`
				} else {
					this._p[i].title = `true: ${this._y[i]}\npred: ${pred[i]}`
				}
			}
			this._observe_target = r
		}
		return [tiles, plot]
	}

	clean() {
		super.clean()
		this._observer.disconnect()
	}
}

