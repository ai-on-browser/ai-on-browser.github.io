import { BaseData } from './base.js'

export default class FunctionalData extends BaseData {
	constructor(setting, r) {
		super(setting, r)
		this._n = 100
		const width = this._manager.platform.width

		this._x = []
		for (let i = 0; i < this._n; i++) {
			this._x.push([i * width / this._n])
		}
		this._y = []
		this._p = []

		this._defaultrange = [0, 10]
		this._range = [0, 10]
		this._padding = 50

		this._funcs = {
			linear: {
				f: v => v
			},
			sin: {
				f: Math.sin
			},
			cos: {
				f: Math.cos
			},
			tanh: {
				f: Math.tanh,
				range: [-5, 5]
			},
			gaussian: {
				f: v => Math.exp(-(v ** 2) / 2),
				range: [-5, 5]
			},
			log: {
				f: Math.log,
				range: [1, 50]
			},
			exp: {
				f: Math.exp,
				range: [0, 5]
			}
		}

		const elm = this.setting.data.configElement
		elm.append("span")
			.text("Function")
			.style("margin-left", "1em")
		elm.append("select")
			.attr("name", "function")
			.on("change", () => {
				const fun = elm.select("[name=function]").property("value")
				this._range = [].concat(this._funcs[fun].range || this._defaultrange)
				elm.select("[name=min]").property("value", this._range[0])
				elm.select("[name=max]").property("value", this._range[1])
				this._createData()
			})
			.selectAll("option")
			.data(Object.keys(this._funcs))
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d)
		elm.append("span").text(" Domain ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "min")
			.attr("max", 1000)
			.attr("min", -1000)
			.attr("value", 0)
			.on("change", () => {
				this._range[0] = +elm.select("[name=min]").property("value")
				this._createData()
			})
		elm.append("span").text(" - ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "max")
			.attr("max", 1000)
			.attr("min", -1000)
			.attr("value", 10)
			.on("change", () => {
				this._range[1] = +elm.select("[name=max]").property("value")
				this._createData()
			})
		elm.append("span").text(" Number ")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "number")
			.attr("max", 1000)
			.attr("min", 1)
			.attr("value", 100)
			.on("change", () => {
				this._x = []
				this._n = +elm.select("[name=number]").property("value")
				for (let i = 0; i < this._n; i++) {
					this._x.push([i * width / this._n])
				}
				this._createData()
			})
		this._createData()
	}

	get series() {
		return this._p.map(p => [p.at[1]])
	}

	get availTask() {
		return ['RG', 'IN', 'SM', 'TP', 'CP']
	}

	get domain() {
		const width = this._manager.platform.width
		return [[0, width]]
	}

	_createData() {
		const n = this._x.length
		const elm = this.setting.data.configElement
		const fun = elm.select("[name=function]").property("value")
		const domain = this.domain[0]
		const xv = this._x.map(x => (x - domain[0]) / (domain[1] - domain[0]) * (this._range[1] - this._range[0]) + this._range[0])

		this._y = xv.map(this._funcs[fun].f)

		const s = (Math.max(...this._y) - Math.min(...this._y)) / 4
		for (let i = 0; i < n; i++) {
			this._y[i] += Math.random() * s - s / 2
		}
		for (let i = 0; i < n; i++) {
			if (this._p[i]) {
				this._p[i].at = [this._x[i][0], this._convPlotY(this._y[i])]
			} else {
				this._p.push(new DataPoint(this._r, [this._x[i][0], this._convPlotY(this._y[i])], 0))
			}
		}
		this._manager.platform.render && this._manager.platform.render()
	}

	_convPlotY(v) {
		const height = this._manager.platform.height
		const r = [Math.min(...this._y), Math.max(...this._y)]
		return (height - this._padding * 2) * (v - r[0]) / (r[1] - r[0]) + this._padding
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = [v[0]]
					this._p[i].at = [v[0], this._convPlotY(this._y[i])]
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
		const max = this.domain.map(r => r[1])
		const tiles = [];
		for (let i = 0; i < max[0] + step[0]; i += step[0]) {
			tiles.push([i]);
		}
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			const p = [];
			for (let i = 0; i < pred.length; i++) {
				p.push([i * step[0], pred[i]]);
			}

			const line = d3.line().x(d => d[0]).y(d => this._convPlotY(d[1]));
			r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(p));
		}
		return [tiles, plot]
	}

	terminate() {
		super.terminate()
	}
}

