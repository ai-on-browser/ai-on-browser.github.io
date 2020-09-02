export class BaseData {
	constructor(svg, r) {
		this._x = []
		this._y = []
		this._p = []
		this._svg = svg
		this._r = r
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

	splice(start, count, ...items) {
	}

	swap(i, j) {
		[this._x[i], this._x[j]] = [this._x[j], this._x[i]];
		[this._y[i], this._y[j]] = [this._y[j], this._y[i]];
		[this._p[i], this._p[j]] = [this._p[j], this._p[i]];
	}

	predict(step) {
		return [this._x, (pred, r) => {}]
	}

	clean() {
		this._p.forEach(p => p.remove())
	}
}

class ManualData extends BaseData {
	constructor(svg, r, setting) {
		super(svg, r)
		this._doclip = true
		this._padding = [10, 10]

		this._dim = 2
		this._svg.select(".dummy-range").attr("opacity", null)
		d3.select("#pallet").style("display", "block")

		this._setting = setting
		const elm = setting.data.configElement
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
				this._setting.ml.refresh()
				this._setting.vue.$forceUpdate()
			})
	}

	get availTask() {
		if (this._dim === 1) {
			return ['RG', 'AD']
		}
		return []
	}

	get domain() {
		if (this._dim === 1) {
			return [
				[0, this._svg.node().getBoundingClientRect().width],
			]
		} else {
			return [
				[0, this._svg.node().getBoundingClientRect().width],
				[0, this._svg.node().getBoundingClientRect().height],
			]
		}
	}

	get dimension() {
		return this._dim
	}

	set dimension(value) {
		this._dim = value
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
			this._svg.node().getBoundingClientRect().width,
			this._svg.node().getBoundingClientRect().height
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
		const plot = (pred, r) => {
			r.selectAll("*").remove();
			let smooth = false
			if (this._dim === 1) {
				const p = [];
				smooth = pred.some(v => !Number.isInteger(v))
				if (smooth) {
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
					new DataHulls(t, p, [1000, step[0]], smooth);
				}
			} else {
				let c = 0;
				const p = [];
				for (let i = 0, w = 0; w < max[0]; i++, w += step[0]) {
					for (let j = 0, h = 0; h < max[1]; j++, h += step[1]) {
						if (!p[j]) p[j] = [];
						smooth |= !Number.isInteger(pred[c])
						p[j][i] = pred[c++];
					}
				}
				if (!smooth && pred.length > 100) {
					smooth |= new Set(pred).size > 100
				}

				const t = r.append("g").attr("opacity", 0.5)
				new DataHulls(t, p, step, smooth);
			}
		}
		return [tiles, plot]
	}

	clean() {
		super.clean()
		this._svg.select(".dummy-range").attr("opacity", 0)
		d3.select("#pallet").style("display", "none")
		this._setting.data.configElement.selectAll("*").remove()
	}
}

class DataManager {
	constructor(manager) {
		this._manager = manager
		this._setting = manager.setting
		this._svg = this._setting.svg
		const pointDatas = this._svg.append("g").classed("points", true)
		this._r = pointDatas.append("g").attr("class", "datas");
		this._data = new ManualData(this._svg, this._r, this._setting)

		this._type = "manual"

		import('../js/pallet.js').then(obj => {
			obj.default(manager)
		})
	}

	get type() {
		return this._type
	}

	set type(value) {
		this.setType(value)
	}

	setType(value, cb) {
		this.remove()
		this._data.clean()
		this._type = value

		if (this._type === "manual") {
			this._data = new ManualData(this._svg, this._r, this._setting)
			this._manager.platform && this._manager.platform.init()
			cb && cb()
		} else {
			import(`./${value}.js`).then(obj => {
				this._data = new obj.default(this._svg, this._r)
				this._manager.platform && this._manager.platform.init()
				cb && cb()
			})
		}
	}

	get availTask() {
		return this._data.availTask
	}

	get data() {
		return this._data
	}

	get domain() {
		return this._data.domain
	}

	get dimension() {
		return this._data.dimension
	}

	get length() {
		return this._data.length
	}

	get x() {
		return this._data.x
	}

	get y() {
		return this._data.y
	}

	get points() {
		return this._data.points
	}

	*[Symbol.iterator]() {
		const l = this._data.length
		for (let i = 0; i < l; i++) {
			yield this._data.at(i)
		}
	}

	at(i) {
		return this._data.at(i)
	}

	set(i, x, y) {
		this._data.splice(i, 1, x, y)
	}

	push(...items) {
		this._data.splice(this._data.length, 0, ...items)
	}

	pop() {
		return this._data.splice(this._data.length - 1, 1)[0]
	}

	unshift(...items) {
		this._data.splice(0, 0, ...items)
	}

	shift() {
		return this._data.splice(0, 1)[0]
	}

	splice(start, count, ...items) {
		return this._data.splice(start, count, ...items)
	}

	slice(start, end) {
		const r = []
		for (let i = start; i < end; i++) {
			r.push(this._data.at(i))
		}
		return r
	}

	forEach(cb) {
		const l = this._data.length
		for (let i = 0; i < l; i++) {
			cb(this._data.at(i), i, this)
		}
	}

	map(cb) {
		const l = this._data.length
		const r = []
		for (let i = 0; i < l; i++) {
			r.push(cb(this._data.at(i), i, this))
		}
		return r
	}

	sort(cb) {
		const l = this._data.length
		const v = []
		for (let i = 0; i < l; i++) {
			v[i] = this._data.at(i)
			for (let j = i; j > 0; j--) {
				if (cb(v[j - 1], v[j]) > 0) {
					this._data.swap(j - 1, j)
				}
			}
		}
	}

	predict(step) {
		return this._data.predict(step)
	}

	remove() {
		this._data.splice(0, this._data.length)
	}
}

export default DataManager

