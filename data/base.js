
const scale = function (v, smin, smax, dmin, dmax) {
	return (v - smin) / (smax - smin) * (dmax - dmin) + dmin
}

class DataRenderer {
	constructor(data) {
		this._data = data
		this._manager = data._manager
		this._r = this.setting.svg.select("g.points g.datas")
		if (this._r.size() === 0) {
			const pointDatas = this.setting.svg.append("g").classed("points", true)
			this._r = pointDatas.append("g").classed("datas", true);
		}

		this._p = []
		this._pad = 10
		this._clip_pad = -Infinity
		this._pred_count = 0

		this._observe_target = null
		this._observer = new MutationObserver(mutations => {
			if (this._observe_target) {
				this._p.forEach((p, i) => p.title = this._data._categorical_output ? this._data._output_category_names[this._data.y[i] - 1] : this._data.y[i])
			}
		})
		this._observer.observe(this.setting.svg.node(), {
			childList: true
		})
		this._k = () => this._series ? [Math.min(1, this._data.dimension - 1)] : this._data.dimension === 1 ? [0] : [0, 1]

		this._will_render = false

		this._path = this._r.append("path")
			.attr("stroke", "black")
			.classed("series-path", true)
			.attr("fill-opacity", 0)
			.attr("opacity", 0)
			.style("pointer-events", "none")
	}

	get padding() {
		if (!Array.isArray(this._pad)) {
			return [this._pad, this._pad]
		}
		return this._pad
	}

	set padding(pad) {
		this._pad = pad
		this.render()
	}

	set clipPadding(pad) {
		this._clip_pad = pad
		this.render()
	}

	get _series() {
		const task = this.setting.vue.mlTask
		return ["TP", "SM", "CP"].indexOf(task) >= 0
	}

	get setting() {
		return this._manager.setting
	}

	get width() {
		return this._manager.platform.width
	}

	get height() {
		return this._manager.platform.height
	}

	get points() {
		return this._p
	}

	_make_selector(names) {
		let e = this.setting.data.configElement.select("div.column-selector")
		if (e.size() === 0) {
			e = this.setting.data.configElement.append("div")
				.classed("column-selector", true)
		} else {
			e.selectAll("*").remove()
		}
		if (this._data.dimension <= 2) {
			this._k = () => this._series ? [Math.min(1, this._data.dimension - 1)] : this._data.dimension === 1 ? [0] : [0, 1]
		} else if (this._data.dimension <= 4) {
			const elm = e.append("table")
				.style("border-collapse", "collapse")
			let row = elm.append("tr").style("text-align", "center")
			row.append("td")
			row.append("td").text(">")
			row.append("td").text("V").style("transform", "rotate(180deg")
			const ck1 = []
			const ck2 = []
			for (let i = 0; i < this._data.dimension; i++) {
				row = elm.append("tr")
				elm.append("td").text(names[i])
					.style("text-align", "right")
				const d1 = elm.append("td")
					.append("input")
					.attr("type", "radio")
					.attr("name", "data-d1")
					.on("change", () => this.render())
				ck1.push(d1)
				const d2 = elm.append("td")
					.append("input")
					.attr("type", "radio")
					.attr("name", "data-d2")
					.on("change", () => this.render())
				ck2.push(d2)
			}
			ck1[0].property("checked", true)
			ck2[1].property("checked", true)
			this._k = () => {
				const k = []
				for (let i = 0; i < this._data.dimension; i++) {
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
				.on("change", () => this.render())
			slct1.selectAll("option")
				.data(names)
				.enter()
				.append("option")
				.attr("value", d => d)
				.text(d => d)
			slct1.property("value", names[0])
			e.append("span").text("V").style("transform", "rotate(180deg").style("display", "inline-block")
			const slct2 = e.append("select")
				.on("change", () => this.render())
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
		this.render()
	}

	_clip(x) {
		if (this._clip_pad === -Infinity) {
			return x
		}
		const limit = [
			this.width,
			this.height
		]
		for (let i = 0; i < x.length; i++) {
			if (x[i] < this._clip_pad) {
				x[i] = this._clip_pad
			} else if (limit[i] - this._clip_pad < x[i]) {
				x[i] = limit[i] - this._clip_pad
			}
		}
		return x
	}

	render() {
		if (!this._will_render) {
			this._will_render = true
			Promise.resolve().then(() => {
				this._will_render = false
				this._render()
			})
		}
	}

	toPoint(value) {
		const k = this._k()
		const domain = this._series ? this._data.series.domain : this._data.domain
		const range = [this.width, this.height]
		const [ymin, ymax] = this._data.range
		const d = k.map((t, s) => scale(value[t], domain[t][0], domain[t][1], 0, range[s] - this.padding[s] * 2) + this.padding[s])
		if (this._series) {
			if (Array.isArray(value[0])) {
				const r = this._data.domain[0]
				d[1] = scale(value[1], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
				d[0] = scale(value[0][0], r[0], r[1], 0, range[0] - this.padding[0] * 2) + this.padding[0]
			} else {
				const k0 = Math.min(k[0], value[1].length - 1)
				d[1] = scale(value[1][k0], domain[k[0]][0], domain[k[0]][1], 0, range[1] - this.padding[1] * 2) + this.padding[1]
				d[0] = scale(value[0], 0, this._data.length + this._pred_count, 0, range[0] - this.padding[0] * 2) + this.padding[0]
			}
		}
		if (d.length === 1 && value.length > 1) {
			d[1] = scale(value[1], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
		}
		return d
	}

	toValue(x) {
		if (x && this._series){
			return [scale(x[0] - this.padding[0], 0, this.width - this.padding[0] * 2, 0, this._data.length)]
		}
		return []
	}

	_render() {
		if (this._data.dimension === 0) {
			return
		}
		const k = this._k()
		const n = this._data.length
		const domain = this._series ? this._data.series.domain : this._data.domain
		const range = [this.width, this.height]
		const [ymin, ymax] = this._data.range
		const path = []
		for (let i = 0; i < n; i++) {
			const d = k.map((t, s) => scale(this._data.x[i][t], domain[t][0], domain[t][1], 0, range[s] - this.padding[s] * 2) + this.padding[s])
			if (this._series) {
				d[1] = scale(this._data.series.values[i][k[0]], domain[k[0]][0], domain[k[0]][1], 0, range[1] - this.padding[1] * 2) + this.padding[1]
				d[0] = scale(i, 0, n + this._pred_count, 0, range[0] - this.padding[0] * 2) + this.padding[0]
			}
			if (d.length === 1) {
				d[1] = scale(this._data.y[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]
			}

			path.push(d)
			if (this._p[i]) {
				this._p[i].at = this._clip(d)
				this._p[i].category = this._data.dimension === 1 ? 0 : this._data.y[i]
			} else {
				this._p[i] = new DataPoint(this._r, this._clip(d), this._data.dimension === 1 ? 0 : this._data.y[i])
			}
			this._p[i].title = this._data._categorical_output ? this._data._output_category_names[this._data.y[i] - 1] : this._data.y[i]
		}
		for (let i = n; i < this._p.length; i++) {
			this._p[i].remove()
		}
		this._p.length = n
		if (this._series) {
			const line = d3.line().x(d => d[0]).y(d => d[1])
			this._r.select("path.series-path")
				.attr("d", line(path))
				.attr("opacity", 0.5)
		} else {
			this._r.select("path.series-path").attr("opacity", 0)
		}
	}

	predict(step) {
		if (!Array.isArray(step)) {
			step = [step, step];
		}
		const domain = this._data.domain
		const range = [this.width, this.height]
		const tiles = []
		if (this._data.dimension <= 2) {
			for (let i = 0; i < range[0] + step[0]; i += step[0]) {
				const w = scale(i - this.padding[0], 0, range[0] - this.padding[0] * 2, domain[0][0], domain[0][1])
				if (this._data.dimension === 1) {
					tiles.push([w])
				} else {
					for (let j = 0; j < range[1] - step[1] / 100; j += step[1]) {
						const h = scale(j - this.padding[1], 0, range[1] - this.padding[1] * 2, domain[1][0], domain[1][1])
						tiles.push([w, h])
					}
				}
			}
		} else {
			for (let i = 0; i < this._data.x.length; i++) {
				tiles.push(this._data.x[i].concat())
			}
		}
		const task = this.setting.vue.mlTask
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			let smooth = pred.some(v => !Number.isInteger(v))
			if (this._data.dimension === 1) {
				const p = [];
				if (smooth && task !== 'DE') {
					const [ymin, ymax] = this._data.range
					for (let i = 0; i < pred.length; i++) {
						p.push([scale(tiles[i], domain[0][0], domain[0][1], 0, range[0] - this.padding[0] * 2) + this.padding[0], scale(pred[i], ymin, ymax, 0, range[1] - this.padding[1] * 2) + this.padding[1]])
					}

					const line = d3.line().x(d => d[0]).y(d => d[1])
					r.append("path").attr("stroke", "red").attr("fill-opacity", 0).attr("d", line(p));
				} else {
					p.push([], [])
					for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
						p[0][i] = pred[i]
						p[1][i] = pred[i]
					}

					const t = r.append("g")
					new DataHulls(t, p, [step[0], 1000], smooth);
				}
			} else if (this._data.dimension === 2) {
				let c = 0;
				const p = [];
				for (let i = 0, w = 0; w < range[0] + step[0]; i++, w += step[0]) {
					for (let j = 0, h = 0; h < range[1] - step[1] / 100; j++, h += step[1]) {
						if (!p[j]) p[j] = [];
						p[j][i] = pred[c++];
					}
				}
				if (!smooth && pred.length > 100) {
					smooth |= new Set(pred).size > 100
				}

				const t = r.append("g")
				new DataHulls(t, p, step, smooth || task === 'DE');
			} else {
				const t = r.append("g")
				const name = pred.every(Number.isInteger)
				for (let i = 0; i < pred.length; i++) {
					const o = new DataCircle(t, this._p[i])
					o.color = getCategoryColor(pred[i]);
					if (name && this._data._categorical_output) {
						this._p[i].title = `true: ${this._data._output_category_names[this._data.y[i] - 1]}\npred: ${this._data._output_category_names[pred[i] - 1]}`
					} else {
						this._p[i].title = `true: ${this._data.y[i]}\npred: ${pred[i]}`
					}
				}
				this._observe_target = r
			}
		}
		return [tiles, plot]
	}

	terminate() {
		this._p.forEach(p => p.remove())
		this.setting.data.configElement.selectAll("*").remove()
		this._observer.disconnect()
	}
}

export class BaseData {
	constructor(manager) {
		this._x = []
		this._y = []
		this._manager = manager

		this._renderer = new DataRenderer(this)
	}

	get setting() {
		return this._manager.setting
	}

	get svg() {
		return this._manager.setting.svg
	}

	get availTask() {
		return []
	}

	get dimension() {
		return this.domain.length
	}

	get domain() {
		if (this.length === 0) {
			return []
		}
		const domain = []
		for (let i = 0; i < this.x[0].length; i++) {
			domain.push([Infinity, -Infinity])
		}
		for (const x of this.x) {
			for (let d = 0; d < x.length; d++) {
				domain[d][0] = Math.min(domain[d][0], x[d])
				domain[d][1] = Math.max(domain[d][1], x[d])
			}
		}
		return domain
	}

	get range() {
		const range = [Infinity, -Infinity]
		for (const y of this.y) {
			range[0] = Math.min(range[0], y)
			range[1] = Math.max(range[1], y)
		}
		return range
	}

	get categories() {
		return [...new Set(this.y)]
	}

	get length() {
		return this._x.length
	}

	get x() {
		return this._x
	}

	get series() {
		return {
			values: this.x,
			get domain() {
				if (this.values.length === 0) {
					return []
				}
				const domain = []
				for (let i = 0; i < this.values[0].length; i++) {
					domain.push([Infinity, -Infinity])
				}
				for (const x of this.values) {
					for (let d = 0; d < x.length; d++) {
						domain[d][0] = Math.min(domain[d][0], x[d])
						domain[d][1] = Math.max(domain[d][1], x[d])
					}
				}
				return domain
			}
		}
	}

	get y() {
		return this._y
	}

	get points() {
		return this._renderer.points
	}

	get scale() {
		return 1
	}

	set scale(s) {
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
		this._renderer.terminate()
		this.setting.data.configElement.selectAll("*").remove()
		this.remove()
	}
}

export class MultiDimensionalData extends BaseData {
	constructor(manager) {
		super(manager)

		this._categorical_output = false
		this._output_category_names = null
	}

	predict(step) {
		return this._renderer.predict(step)
	}

	terminate() {
		super.terminate()
	}
}

export class FixData extends MultiDimensionalData {
	constructor(manager) {
		super(manager)
		this._domain = null
	}

	get domain() {
		if (this._domain) {
			return this._domain
		}

		return this._domain = super.domain
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
				get: () => this.points[i]
			}
		})
	}
}

let loadedPallet = false

export class ManualData extends BaseData {
	constructor(manager) {
		super(manager)
		this._renderer.padding = 0
		this._renderer.clipPadding = 10

		this._dim = 2
		this._scale = 1 / 1000
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
		const dimElm = elm.append("input")
			.attr("type", "number")
			.attr("min", 1)
			.attr("max", 2)
			.attr("value", this._dim)
			.on("change", () => {
				this._dim = +dimElm.property("value")
				this.setting.ml.refresh()
				this.setting.vue.$forceUpdate()
				this._renderer.render()
			})

		const w = this._manager.platform.width
		const h = this._manager.platform.height
		this.addCluster([w / 4, h / 3], 0, 50, 100, 1)
		this.addCluster([w / 2, h * 2 / 3], 0, 50, 100, 2)
		this.addCluster([w * 3 / 4, h / 3], 0, 50, 100, 3)
	}

	get availTask() {
		if (this._dim === 1) {
			return ['RG', 'IN', 'AD', 'DE']
		}
		return ['CT', 'CF', 'RG', 'AD', 'DR', 'FS', 'DE', 'GR', 'MD', 'GM', 'SM', 'TP', 'CP']
	}

	get domain() {
		const w = this._manager.platform.width
		const h = this._manager.platform.height
		if (this._dim === 1) {
			return [[0, w * this._scale]]
		} else {
			return [
				[0, w * this._scale],
				[0, h * this._scale],
			]
		}
	}

	get range() {
		if (this._dim === 1) {
			return [0, this._manager.platform.height * this._scale]
		}
		return super.range
	}

	get dimension() {
		return this._dim
	}

	get x() {
		if (this._dim === 1) {
			return this._x.map(v => [v[0] * this._scale])
		}
		return this._x.map(v => v.map(a => a * this._scale))
	}

	get y() {
		if (this._dim === 1) {
			return this._x.map(v => v[1] * this._scale)
		}
		return this._y
	}

	get scale() {
		return this._scale
	}

	set scale(s) {
		this._scale = s
	}

	set clip(value) {
		this._renderer.clipPadding = value ? 10 : -Infinity
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._dim === 1 ? [this._x[i][0] * this._scale] : this._x[i].map(v => v * this._scale),
				set: v => {
					this._x[i] = v.map(a => a / this._scale)
					this._renderer.render()
				}
			},
			y: {
				get: () => this._dim === 1 ? this._x[i][1] : this._y[i],
				set: v => {
					this._y[i] = v
					this._renderer.render()
				}
			},
			point: {
				get: () => this.points[i]
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
		const idx = this._renderer.toValue(x[0])[0]
		let sx, sy
		if (idx !== undefined) {
			sx = this._x.splice(start, count)
			sy = this._y.splice(start, count)
			this._x.splice(idx, 0, ...x)
			this._y.splice(idx, 0, ...y)
		} else {
			sx = this._x.splice(start, count, ...x)
			sy = this._y.splice(start, count, ...y)
		}
		this._renderer.render()

		return sx.map((v, i) => [v, sy[i]])
	}

	predict(step) {
		return this._renderer.predict(step)
	}

	terminate() {
		super.terminate()
		this.svg.select(".dummy-range").attr("opacity", 0)
		d3.select("#pallet").classed("show", false)
	}

	addCluster(center, r, noise, count, category) {
		const datas = []
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
			datas.push(c, +category)
		}
		this.push(...datas)
	}
}

export default ManualData

