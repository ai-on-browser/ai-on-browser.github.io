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
		fit_cb(points.map(v => v.at[1] / scale), points.map(v => v.category), null, (pred) => {
			this._pred = pred.map(v => v * scale);
			cb(this._pred.length)
		})
	}

	plot(to_x) {
		const line = d3.line().x(d => d[0]).y(d => d[1])
		this._points.forEach(p => p.remove())
		const points = this._platform._points
		const path = []
		if (points.length > 0) {
			path.push(points[points.length - 1].at)
		}
		for (let i = 0; i < this._pred.length; i++) {
			const a = [to_x(i + points.length), this._pred[i]]
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
		fit_cb(points.map(v => v.at[1] / scale), points.map(v => v.category), null, (pred) => {
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

export default class SeriesPlatform {
	constructor(task, setting) {
		this._svg = setting.svg;
		this._task = task;
		this._setting = setting;
		this._points = setting.points;
		this._k = 0

		this.init();
	}

	get task() {
		return this._task;
	}

	get setting() {
		return this._setting
	}

	get width() {
		return this._svg.node().getBoundingClientRect().width;
	}

	get height() {
		return this._svg.node().getBoundingClientRect().height;
	}

	get points() {
		return this._points
	}

	init() {
		if (this._svg.select("g.ts-render").size() === 0) {
			this._svg.insert("g", ":first-child").classed("ts-render", true);
		}
		this._r = this._svg.select("g.ts-render");
		this._r.selectAll("*").remove();
		const _this = this
		this._r.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("opacity", 0)
			.on("click", function() {
				setTimeout(() => {
					_this.render_points()
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
		}
		this.render_points(false)
	}

	to_x(index) {
		const n = this._points.length + this._k
		const dx = this.width / n
		return dx * (index + 0.5)
	}

	render_points(doSort = true) {
		this._points.forEach(p => {
			if (!p._org_position) {
				p._org_position = p.at
			}
		})
		if (doSort) this._points.sort((a, b) => a.at[0] - b.at[0])
		const line = d3.line().x(d => d[0]).y(d => d[1])
		const path = []
		const pn = this._points.length
		for (let i = 0; i < pn; i++) {
			const a = [this.to_x(i), this._points[i].at[1]]
			this._points[i].at = a
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

	plot(fit_cb, scale = 1000) {
		this._plotter.fit(this._points, fit_cb, scale, (k) => {
			this._k = k || 0
			this.render_points()
		})
	}

	clean() {
		this._points.forEach(p => {
			if (p._org_position) {
				p.at = p._org_position
				delete p._org_position
			}
		})
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	close() {
		this.clean();
	}
}

