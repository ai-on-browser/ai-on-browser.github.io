import { FixData } from './base.js'

export default class CSVData extends FixData {
	constructor(manager) {
		super(manager)

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach(p => p.title = "")
			}
		})
		this._observer.observe(this.svg.node(), {
			childList: true
		})

		this._input_category_names = []
		this._output_category_names = null
	}

	setCSV(data, names, types, outcolumn) {
		this._categorical_output = types[outcolumn] === "category"

		this._x = data.map(d => {
			return d.filter((v, i) => i !== outcolumn)
		})
		this._y = data.map(d => d[outcolumn])

		if (this._categorical_output) {
			this._output_category_names = [...new Set(this._y)]
			for (let i = 0; i < this._y.length; i++) {
				this._y[i] = this._output_category_names.indexOf(this._y[i]) + 1
			}
		}

		this._make_selector(names.filter((v, i) => i !== outcolumn))
	}

	_make_selector(names) {
		if (this.dimension <= 2) {
			return
		}
		const type = this.dimension > 4 ? "select" : "radio"
		const e = this.setting.data.configElement.append("div")
			.style("margin-left", "1em")
		if (type === "radio") {
			const elm = e.append("table")
				.style("border-collapse", "collapse")
			let row = elm.append("tr").style("text-align", "center")
			row.append("td")
			row.append("td").text(">")
			row.append("td").text("V")
			const ck1 = []
			const ck2 = []
			for (let i = 0; i < this.dimension; i++) {
				row = elm.append("tr")
				elm.append("td").text(names[i])
				const d1 = elm.append("td")
					.append("input")
					.attr("type", "radio")
					.attr("name", "data-d1")
					.on("change", () => this._plot())
				ck1.push(d1)
				const d2 = elm.append("td")
					.append("input")
					.attr("type", "radio")
					.attr("name", "data-d2")
					.on("change", () => this._plot())
				ck2.push(d2)
			}
			ck1[0].property("checked", true)
			ck2[1].property("checked", true)
			this._k = () => {
				const k = []
				for (let i = 0; i < this.dimension; i++) {
					if (ck1[i].property("checked")) {
						k[0] = i
					}
					if (ck2[i].property("checked")) {
						k[1] = i
					}
				}
				return k
			}
		} else if (type === "select") {
			e.append("span").text(">")
			const slct1 = e.append("select")
				.on("change", () => this._plot())
			slct1.selectAll("option")
				.data(names)
				.enter()
				.append("option")
				.attr("value", d => d)
				.text(d => d)
			slct1.property("value", names[0])
			e.append("span").text(" V")
			const slct2 = e.append("select")
				.on("change", () => this._plot())
			slct2.selectAll("option")
				.data(names)
				.enter()
				.append("option")
				.attr("value", d => d)
				.text(d => d)
			slct2.property("value", names[1])
			this._k = () => [
				names.indexOf(slct1.property("value")),
				names.indexOf(slct2.property("value"))
			]
		}
		this._plot()
	}

	_plot() {
		const k = this._k()
		const n = this.length
		const domain = this.domain
		const rect = this.svg.node().getBoundingClientRect()
		const range = [rect.width, rect.height]
		const padding = 10
		for (let i = 0; i < n; i++) {
			const d = k.map((t, s) => (this.x[i][t] - domain[t][0]) / (domain[t][1] - domain[t][0]) * (range[s] - padding * 2) + padding)
			if (this._p[i]) {
				this._p[i].at = d
			} else {
				this._p[i] = new DataPoint(this._r, d, this.y[i])
			}
		}
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step];
		}
		const tiles = this._x.map(x => x.concat());
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			const t = r.append("g").attr("opacity", 0.5)
			const name = pred.every(Number.isInteger)
			for (let i = 0; i < pred.length; i++) {
				const o = new DataCircle(t, this._p[i])
				o.color = getCategoryColor(pred[i]);
				if (name && this._categorical_output) {
					this._p[i].title = `true: ${this._output_category_names[this._y[i] - 1]}\npred: ${this._output_category_names[pred[i] - 1]}`
				} else {
					this._p[i].title = `true: ${this._y[i]}\npred: ${pred[i]}`
				}
			}
			this._observe_target = r
		}
		return [tiles, plot]
	}

	terminate() {
		super.terminate()
		this._observer.disconnect()
	}
}

