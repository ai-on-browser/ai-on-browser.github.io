import { FixData } from './base.js'

class CSV {
	constructor(data) {
		this._data = data
		this._decoder = new TextDecoder('utf-8')
	}

	get data() {
		return this._data
	}

	async load(urlOrFile) {
		if (urlOrFile instanceof File) {
			await new Promise(resolve => {
				const fr = new FileReader()
				fr.onload = () => {
					this.loadFromString(fr.result)
					resolve()
				}
				fr.readAsText(urlOrFile)
			})
			return
		}
		this._data = []
		for await (let line of this._fetch(urlOrFile)) {
			if (line.length === 0) {
				continue
			}
			const record = line.split(',').map(value => {
				return isNaN(value) ? value : +value
			})
			this._data.push(record)
		}
	}

	loadFromString(str) {
		this._data = []
		for (let line of str.split(/\r\n?|\n/)) {
			if (line.length === 0) {
				continue
			}
			const record = line.split(',').map(value => {
				return isNaN(value) ? value : +value
			})
			this._data.push(record)
		}
	}

	async *_fetch(url) {
		const response = await fetch(url)
		const reader = response.body.getReader()
		let { value: chunk, done: readerDone } = await reader.read()
		chunk = chunk ? this._decoder.decode(chunk) : ''

		const re = /\n|\r|\r\n/gm
		let startIndex = 0

		for (;;) {
			const result = re.exec(chunk)
			if (!result) {
				if (readerDone) {
					break
				}
				const remainder = chunk.substr(startIndex);
				({ value: chunk, done: readerDone } = await reader.read());
				chunk = remainder + (chunk ? this._decoder.decode(chunk) : '')
				startIndex = re.lastIndex = 0
				continue
			}
			yield chunk.substring(startIndex, result.index)
			startIndex = re.lastIndex
		}
		if (startIndex < chunk.length) {
			yield chunk.substr(startIndex)
		}
	}
}

export default class CSVData extends FixData {
	constructor(manager, data, columnInfos) {
		super(manager)

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach((p, i) => p.title = this._categorical_output ? this._output_category_names[this._y[i] - 1] : this._y[i])
			}
		})
		this._observer.observe(this.svg.node(), {
			childList: true
		})

		this._input_category_names = []
		this._output_category_names = null

		if (data && columnInfos) {
			this.setCSV(data, columnInfos)
		}
	}

	setCSV(data, infos, header = false) {
		if (!Array.isArray(data)) {
			const csv = new CSV()
			csv.load(data).then(() => {
				this.setCSV(csv.data, infos, header)
			})
			return
		}
		if (header) {
			const cols = data[0]
			data = data.slice(1)
			if (!infos) {
				infos = cols.map((c, i) => {
					const cat = data.some(d => isNaN(d[i]))
					return {
						name: c,
						type: cat ? 'category' : 'numeric'
					}
				})
				infos[infos.length - 1].out = true
			}
		}
		for (let i = 0, k = 0; i < infos.length; i++) {
			if (infos[i].out) {
				this._categorical_output = infos[i].type === "category"
				this._y = data.map(d => d[i])
			} else if (!infos[i].ignore) {
				if (infos[i].type === "category") {
					this._input_category_names[k] = [...new Set(data.map(d => d[i]))]
				}
				k++
			}
		}
		if (!this._y) {
			throw new Error("There is no 'out' column.")
		}

		this._x = data.map(d => {
			return d.filter((v, i) => !infos[i].out && !infos[i].ignore).map((v, i) => this._input_category_names[i] ? this._input_category_names[i].indexOf(v) : v)
		})

		if (this._categorical_output) {
			this._output_category_names = [...new Set(this._y)]
			for (let i = 0; i < this._y.length; i++) {
				this._y[i] = this._output_category_names.indexOf(this._y[i]) + 1
			}
		}

		this._feature_names = infos.filter(v => !v.out && !v.ignore).map(v => v.name)
		this._make_selector(this._feature_names)
	}

	_make_selector(names) {
		if (this.dimension <= 2) {
			this._k = () => [0, 1]
			return
		}
		let e = this.setting.data.configElement.select("div.column-selector")
		if (e.size() === 0) {
			e = this.setting.data.configElement.append("div")
				.classed("column-selector", true)
				.style("margin-left", "1em")
		} else {
			e.selectAll("*").remove()
		}
		if (this.dimension <= 4) {
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
					.style("text-align", "right")
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
		} else {
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
				this._p[i].title = this._categorical_output ? this._output_category_names[this._y[i] - 1] : this._y[i]
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

