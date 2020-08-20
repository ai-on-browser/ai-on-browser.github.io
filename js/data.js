class DataManager {
	constructor() {
		this._x = []
		this._t = []

		this._p = []

		this._svg = d3.select("svg")
		const pointDatas = this._svg.append("g").classed("points", true)
		this._r = pointDatas.append("g").attr("class", "datas");

		this._doclip = true
		this._padding = [10, 10]
	}

	get domain() {
		return [
			[0, this._svg.node().getBoundingClientRect().width],
			[0, this._svg.node().getBoundingClientRect().height],
		]
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
		return this._t
	}

	get points() {
		return this._p
	}

	set clip(value) {
		this._doclip = value
	}

	*[Symbol.iterator]() {
		for (let i = 0; i < this._x.length; i++) {
			yield this.at(i)
		}
	}

	_splitItems(...items) {
		const x = []
		const t = []
		for (let i = 0; i < items.length; i += 2) {
			x.push(items[i])
			t.push(items[i + 1])
		}
		return [x, t]
	}

	_clip(x) {
		if (!this._doclip) {
			return x
		}
		const domain = this.domain
		for (let i = 0; i < x.length; i++) {
			if (x[i] < domain[i][0] + this._padding[i]) {
				x[i] = domain[i][0] + this._padding[i]
			} else if (domain[i][1] - this._padding[i] < x[i]) {
				x[i] = domain[i][1] - this._padding[i]
			}
		}
		return x
	}

	at(i) {
		return Object.defineProperties({}, {
			x: {
				get: () => this._x[i],
				set: v => {
					this._x[i] = v
					this._p[i].at = this._clip(v)
				}
			},
			y: {
				get: () => this._t[i],
				set: v => {
					this._t[i] = v
					this._p[i].category = v
				}
			},
			point: {
				get: () => this._p[i]
			}
		})
	}

	set(i, x, y) {
		this._x[i] = x
		this._t[i] = y
		this._p[i].at = this._clip(x)
		this._p[i].category = y
	}

	push(...items) {
		for (let i = 0; i < items.length; i += 2) {
			this._x.push(items[i])
			this._t.push(items[i + 1])
			this._p.push(new DataPoint(this._r, this._clip(items[i]), items[i + 1]))
		}
	}

	pop() {
		this._p.pop().remove()
		return [this._x.pop(), this._t.pop()]
	}

	unshift(...items) {
		const [x, y] = this._splitItems(...items)
		this._x.unshift(...x)
		this._t.unshift(...y)
		const ps = x.map((v, i) => new DataPoint(this._r, this._clip(v), y[i]))
		this._p.unshift(...ps)
	}

	shift() {
		this._p.shift().remove()
		return [this._x.shift(), this._t.shift()]
	}

	slice(start, end) {
		const r = []
		const xs = this._x.slice(start, end)
		const ts = this._t.slice(start, end)
		return xs.map((v, i) => [v, ts[i]])
	}

	splice(start, count, ...items) {
		const [x, y] = this._splitItems(...items)
		this._x.splice(start, count, ...x)
		this._t.splice(start, count, ...y)
		const ps = x.map((v, i) => new DataPoint(this._r, this._clip(v), y[i]))
		const rp = this._p.splice(start, count, ...ps)
		rp.forEach(p => p.remove())
	}

	forEach(cb) {
		for (let i = 0; i < this._x.length; i++) {
			cb(this.at(i), i, this)
		}
	}

	map(cb) {
		const r = []
		for (let i = 0; i < this._x.length; i++) {
			r.push(cb(this.at(i), i, this))
		}
		return r
	}

	sort(cb) {
		const v = []
		for (let i = 0; i < this._x.length; i++) {
			v[i] = this.at(i)
			for (let j = i; j > 0; j--) {
				const c = cb(v[j - 1], v[j])
				if (c > 0) {
					[this._x[j - 1], this._x[j]] = [this._x[j], this._x[j - 1]];
					[this._t[j - 1], this._t[j]] = [this._t[j], this._t[j - 1]];
					[this._p[j - 1], this._p[j]] = [this._p[j], this._p[j - 1]];
				}
			}
		}
	}

	clean() {
		this._p.forEach(p => p.remove())
		this._p.length = 0
		this._x.length = 0
		this._t.length = 0
	}
}

const datas = new DataManager()

