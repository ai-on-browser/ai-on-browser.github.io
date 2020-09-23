import { BasePlatform } from './base.js'

class TpPlotter {
	constructor(platform, svg) {
		this._platform = platform
		if (svg.select("g.tp-render").size() === 0) {
			svg.append("g").classed("tp-render", true);
		}
		this._r = svg.select("g.tp-render")
		this._r.append("path")
			.attr("stroke", "black")
			.attr("fill-opacity", 0)
			.style("pointer-events", "none")
		this._pred = []
		this._points = []
	}

	remove() {
		this._r.remove()
	}

	fit(points, fit_cb, scale = 1000, cb) {
		fit_cb(points.map(v => [v.at[1] / scale]), points.map(v => [v.category]), null, (pred) => {
			this._pred = pred.map(v => v * scale);
			cb(this._pred.length)
		})
	}

	plot(to_x) {
		const line = d3.line().x(d => d[0]).y(d => d[1])
		this._points.forEach(p => p.remove())
		this._points = []
		const datas = this._platform.datas
		const path = []
		if (datas.length > 0) {
			path.push(datas.points[datas.length - 1].at)
		}
		for (let i = 0; i < this._pred.length; i++) {
			const a = [to_x(i + datas.length), this._pred[i]]
			const p = new DataPoint(this._r, a, specialCategory.dummy)
			path.push(a)
			this._points.push(p)
		}
		if (path.length === 0) {
			this._r.select("path").attr("opacity", 0)
		} else {
			this._r.select("path")
				.attr("d", line(path))
				.attr("opacity", 0.5)
		}
	}
}

class SmoothPlotter {
	constructor(platform, svg) {
		this._platform = platform
		if (svg.select("g.smooth-render").size() === 0) {
			svg.append("g").classed("smooth-render", true);
		}
		this._r = svg.select("g.smooth-render")
		this._r.append("path")
			.attr("stroke", "red")
			.attr("fill-opacity", 0)
			.style("pointer-events", "none")
		this._pred = []
	}

	remove() {
		this._r.remove()
	}

	fit(points, fit_cb, scale = 1000, cb) {
		fit_cb(points.map(v => [v.at[1] / scale]), points.map(v => [v.category]), null, (pred) => {
			this._pred = pred.map(v => v * scale);
			cb()
		})
	}

	plot(to_x) {
		const line = d3.line().x(d => d[0]).y(d => d[1])
		const path = []
		for (let i = 0; i < this._pred.length; i++) {
			const a = [to_x(i), this._pred[i]]
			path.push(a)
		}
		if (path.length === 0) {
			this._r.select("path").attr("opacity", 0)
		} else {
			this._r.select("path")
				.attr("d", line(path))
				.attr("opacity", 1)
		}
	}
}

class CpdPlotter {
	constructor(platform, svg) {
		this._platform = platform
		if (svg.select("g.cpd-render").size() === 0) {
			svg.insert("g", ":first-child").classed("cpd-render", true);
		}
		this._r = svg.select("g.cpd-render")
		this._pred = []
	}

	remove() {
		this._r.remove()
	}

	fit(points, fit_cb, scale = 1000, cb) {
		const x = points.map(v => [v.at[1] / scale])
		x.rolling = n => {
			const t = x.map(v => v[0])
			const data = []
			for (let i = 0; i < t.length - n + 1; i++) {
				data.push(t.slice(i, i + n))
			}
			return data
		}
		fit_cb(x, points.map(v => [v.category]), null, (pred, threshold) => {
			if (threshold) {
				this._pred = pred.map(v => v > threshold);
				this._pred_value = pred.concat()
			} else {
				this._pred = pred.concat();
				this._pred_value = null
			}
			cb()
		})
	}

	plot(to_x) {
		this._r.selectAll("*").remove()
		if (this._pred_value) {
			const max = Math.max(...this._pred_value)
			const min = Math.min(...this._pred_value)
			const canvas = document.createElement("canvas");
			canvas.width = this._platform.width;
			canvas.height = this._platform.height;
			const ctx = canvas.getContext("2d");
			let x = 0
			for (let i = 0; i < this._pred_value.length; i++) {
				const x1 = to_x(i + 0.5)
				const v = (this._pred_value[i] - min) / (max - min)
				ctx.fillStyle = getCategoryColor(specialCategory.errorRate(v));
				ctx.fillRect(x, 0, x1 - x + 1, this._platform.height);
				x = x1
			}
			this._r.append("image")
				.attr("x", 0).attr("y", 0)
				.attr("width", canvas.width)
				.attr("height", canvas.height)
				.attr("xlink:href", canvas.toDataURL())
				.attr("opacity", 0.3)
		}
		for (let i = 0; i < this._pred.length; i++) {
			if (!this._pred[i]) continue
			const x = to_x(i)
			const l = this._r.append("line")
				.attr("x1", x).attr("x2", x)
				.attr("y1", 0).attr("y2", this._platform.height)
				.attr("stroke", "red")
		}
	}
}

export default class SeriesPlatform extends BasePlatform {
	constructor(task, manager) {
		super(task, manager)
		this._k = 0

		this.init();
	}

	init() {
		if (this.svg.select("g.ts-render").size() === 0) {
			this.svg.insert("g", ":first-child").classed("ts-render", true);
		}
		this._r = this.svg.select("g.ts-render");
		this._r.selectAll("*").remove();
		this._r.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("opacity", 0)
			.on("click", () => {
				setTimeout(() => {
					this.render()
				}, 0)
			})
		this._path = this._r.append("path")
			.attr("stroke", "black")
			.attr("fill-opacity", 0)
			.style("pointer-events", "none")
		if (this._task === 'TP') {
			this._plotter = new TpPlotter(this, this._r)
		} else if (this._task === 'SM') {
			this._plotter = new SmoothPlotter(this, this._r)
		} else if (this._task === 'CP') {
			this._plotter = new CpdPlotter(this, this._r)
		}
		this.datas.clip = false
		this.render(false)
	}

	to_x(index) {
		const n = this.datas.length + this._k
		const dx = this.width / n
		return dx * (index + 0.5)
	}

	render(doSort = true) {
		this.datas.forEach(v => {
			if (!v.point._org_x) {
				v.point._org_x = v.x
			}
		})
		if (doSort) this.datas.sort((a, b) => a.x[0] - b.x[0])
		const line = d3.line().x(d => d[0]).y(d => d[1])
		const path = []
		const pn = this.datas.length
		for (let i = 0; i < pn; i++) {
			const a = [this.to_x(i), this.datas.points[i].at[1]]
			this.datas.at(i).x = a
			path.push(a)
		}
		if (path.length === 0) {
			this._path.attr("opacity", 0)
		} else {
			this._path.attr("d", line(path))
				.attr("opacity", 0.5)
		}
		this._plotter.plot(this.to_x.bind(this))
	}

	plot(fit_cb, step = null, scale = 1000) {
		this._plotter.fit(this.datas.points, fit_cb, scale, (k) => {
			this._k = k || 0
			this.render()
		})
	}

	clean() {
		this.datas.clip = true
		this.datas.forEach(v => {
			if (v.point._org_x) {
				v.x = v.point._org_x
				delete v.point._org_x
			}
		})
		this._r.remove();
		this.svg.selectAll("g").style("visibility", null);
	}

	terminate() {
		this.clean();
	}
}

