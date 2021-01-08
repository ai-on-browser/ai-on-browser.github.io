export class BaseData {
	constructor(manager) {
		this._x = []
		this._y = []
		this._p = []
		this._manager = manager
		this._r = manager.setting.svg.select("g.points g.datas")

		if (this._r.size() === 0) {
			const pointDatas = manager.setting.svg.append("g").classed("points", true)
			this._r = pointDatas.append("g").classed("datas", true);
		}
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this.setting.svg
	}

	get availTask() {
		return []
	}

	get dimension() {
		return this.domain.length
	}

	get length() {
		return this._x.length
	}

	get x() {
		return this._x
	}

	get y() {
		return this._y
	}

	get points() {
		return this._p
	}

	*[Symbol.iterator]() {
		const l = this.length
		for (let i = 0; i < l; i++) {
			yield this.at(i)
		}
	}

	splice(start, count, ...items) {
		return []
	}

	set(i, x, y) {
		this.splice(i, 1, x, y)
	}

	push(...items) {
		this.splice(this.length, 0, ...items)
	}

	pop() {
		return this.splice(this.length - 1, 1)[0]
	}

	unshift(...items) {
		this.splice(0, 0, ...items)
	}

	shift() {
		return this.splice(0, 1)[0]
	}

	slice(start, end) {
		const r = []
		for (let i = start; i < end; i++) {
			r.push(this.at(i))
		}
		return r
	}

	forEach(cb) {
		const l = this.length
		for (let i = 0; i < l; i++) {
			cb(this.at(i), i, this)
		}
	}

	map(cb) {
		const l = this.length
		const r = []
		for (let i = 0; i < l; i++) {
			r.push(cb(this.at(i), i, this))
		}
		return r
	}

	swap(i, j) {
		[this._x[i], this._x[j]] = [this._x[j], this._x[i]];
		[this._y[i], this._y[j]] = [this._y[j], this._y[i]];
		[this._p[i], this._p[j]] = [this._p[j], this._p[i]];
	}

	sort(cb) {
		const l = this.length
		const v = []
		for (let i = 0; i < l; i++) {
			v[i] = this.at(i)
			for (let j = i; j > 0; j--) {
				if (cb(v[j - 1], v[j]) > 0) {
					this.swap(j - 1, j)
				}
			}
		}
	}

	predict(step) {
		return [this._x, (pred, r) => {}]
	}

	remove() {
		this.splice(0, this.length)
	}

	terminate() {
		this._p.forEach(p => p.remove())
		this.setting.data.configElement.selectAll("*").remove()
		this.remove()
	}
}

export class FixData extends BaseData {
	constructor(manager) {
		super(manager)
		this._domain = null
	}

	get domain() {
		if (this._domain) {
			return this._domain
		}

		const domain = this._domain = []
		for (let i = 0; i < this.x[0].length; i++) {
			domain.push([Infinity, -Infinity])
		}
		for (const x of this.x) {
			for (let d = 0; d < x.length; d++) {
				domain[d][0] = Math.min(domain[d][0], x[d])
				domain[d][1] = Math.max(domain[d][1], x[d])
			}
		}
		return this._domain
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i]
			},
			y: {
				get: () => this._y[i]
			},
			point: {
				get: () => this._p[i]
			}
		})
	}
}

export class MultiDimensionalData extends FixData {
	constructor(manager) {
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
		this._categorical_output = false
		this._output_category_names = null
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

let loadedPallet = false

export class ManualData extends BaseData {
	constructor(manager) {
		super(manager)
		this._doclip = true
		this._padding = [10, 10]

		this._dim = 2
		this.svg.select(".dummy-range").attr("opacity", null)
		if (!loadedPallet) {
			loadedPallet = true
			import('../js/pallet.js').then(obj => {
				obj.default(manager)
				d3.select("#pallet").classed("show", true)
			})
		} else {
			d3.select("#pallet").classed("show", true)
		}

		const elm = this.setting.data.configElement
		elm.append("span")
			.text("Dimension")
			.style("margin-left", "1em")
		const dimElm = elm.append("input")
			.attr("type", "number")
			.attr("min", 1)
			.attr("max", 2)
			.attr("value", this._dim)
			.on("change", () => {
				this._dim = +dimElm.property("value")
				this.setting.ml.refresh()
				this.setting.vue.$forceUpdate()
			})

		const w = this.svg.node().getBoundingClientRect().width
		const h = this.svg.node().getBoundingClientRect().height
		this.addCluster([w / 4, h / 3], 0, 50, 100, 1)
		this.addCluster([w / 2, h * 2 / 3], 0, 50, 100, 2)
		this.addCluster([w * 3 / 4, h / 3], 0, 50, 100, 3)
	}

	get availTask() {
		if (this._dim === 1) {
			return ['RG', 'IN', 'AD', 'DE']
		}
		return ['CT', 'CF', 'RG', 'AD', 'DR', 'FS', 'DE', 'GR', 'MD', 'SM', 'TP', 'CP']
	}

	get domain() {
		const w = this.svg.node().getBoundingClientRect().width
		const h = this.svg.node().getBoundingClientRect().height
		if (this._dim === 1) {
			return [[0, w]]
		} else {
			return [
				[0, w],
				[0, h],
			]
		}
	}

	get dimension() {
		return this._dim
	}

	get x() {
		if (this._dim === 1) {
			return this._x.map(v => [v[0]])
		}
		return this._x
	}

	get y() {
		if (this._dim === 1) {
			return this._x.map(v => v[1])
		}
		return this._y
	}

	set clip(value) {
		this._doclip = value
	}

	_clip(x) {
		if (!this._doclip) {
			return x
		}
		const limit = [
			this.svg.node().getBoundingClientRect().width,
			this.svg.node().getBoundingClientRect().height
		]
		for (let i = 0; i < x.length; i++) {
			if (x[i] < this._padding[i]) {
				x[i] = this._padding[i]
			} else if (limit[i] - this._padding[i] < x[i]) {
				x[i] = limit[i] - this._padding[i]
			}
		}
		return x
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._dim === 1 ? [this._x[i][0]] : this._x[i],
				set: v => {
					this._x[i] = v
					this._p[i].at = this._clip(v)
				}
			},
			y: {
				get: () => this._dim === 1 ? this._x[i][1] : this._y[i],
				set: v => {
					this._y[i] = v
					this._p[i].category = v
				}
			},
			point: {
				get: () => this._p[i]
			}
		})
	}

	splice(start, count, ...items) {
		const x = []
		const y = []
		for (let i = 0; i < items.length; i += 2) {
			x.push(items[i])
			y.push(items[i + 1])
		}
		const sx = this._x.splice(start, count, ...x)
		const sy = this._y.splice(start, count, ...y)
		const ps = x.map((v, i) => new DataPoint(this._r, this._clip(v), y[i]))
		const rp = this._p.splice(start, count, ...ps)
		rp.forEach(p => p.remove())

		return sx.map((v, i) => [v, sy[i]])
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step];
		}
		const max = this.domain.map(r => r[1])
		const tiles = [];
		if (this._dim === 1) {
			for (let i = 0; i < max[0] + step[0]; i += step[0]) {
				tiles.push([i]);
			}
		} else {
			for (let i = 0; i < max[0]; i += step[0]) {
				for (let j = 0; j < max[1]; j += step[1]) {
					tiles.push([i, j]);
				}
			}
		}
		const task = this.setting.vue.mlTask
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			let smooth = false
			if (this._dim === 1) {
				const p = [];
				smooth = pred.some(v => !Number.isInteger(v))
				if (smooth && task !== 'DE') {
					for (let i = 0; i < pred.length; i++) {
						p.push([i * step[0], pred[i]]);
					}
					const line = d3.line().x(d => d[0]).y(d => d[1]);
					r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(p));
				} else {
					for (let i = 0, w = 0; w < max[0]; i++, w += step[0]) {
						for (let j = 0, h = 0; h < 1001; j++, h += 1000) {
							if (!p[j]) p[j] = [];
							p[j][i] = pred[i];
						}
					}

					const t = r.append("g").attr("opacity", 0.5)
					new DataHulls(t, p, [step[0], 1000], smooth);
				}
			} else {
				let c = 0;
				const p = [];
				for (let i = 0, w = 0; w < max[0]; i++, w += step[0]) {
					for (let j = 0, h = 0; h < max[1] - step[1] / 100; j++, h += step[1]) {
						if (!p[j]) p[j] = [];
						smooth |= !Number.isInteger(pred[c])
						p[j][i] = pred[c++];
					}
				}
				if (!smooth && pred.length > 100) {
					smooth |= new Set(pred).size > 100
				}

				const t = r.append("g").attr("opacity", 0.5)
				new DataHulls(t, p, step, smooth || task === 'DE');
			}
		}
		return [tiles, plot]
	}

	terminate() {
		super.terminate()
		this.svg.select(".dummy-range").attr("opacity", 0)
		d3.select("#pallet").classed("show", false)
	}

	addCluster(center, r, noise, count, category) {
		for (let i = 0; i < count; i++) {
			let c = [0, 0]
			if (r > 0) {
				do {
					c = [Math.random() * 2 - 1, Math.random() * 2 - 1]
				} while (c[0] ** 2 + c[1] ** 2 <= 1)
			}
			c[0] = c[0] * r + center[0]
			c[1] = c[1] * r + center[1]
			if (noise > 0) {
				const nr = normal_random(0, noise)
				c[0] += nr[0]
				c[1] += nr[1]
			}
			this.push(c, +category)
		}
	}
}

export default ManualData

