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
	}

	get availTask() {
		if (this._dim === 1) {
			return ['RG', 'AD', 'DE']
		}
		return []
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
			this.push(c, category)
		}
	}
}

export default ManualData

