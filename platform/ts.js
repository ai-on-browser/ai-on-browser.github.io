export default class TSPlatform {
	constructor(task, setting) {
		this._svg = setting.svg;
		this._task = task;
		this._setting = setting;
		this._points = setting.points;
		this._t_points = []
		this._pred = []

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

	init() {
		if (this._svg.select("g.ts-render").size() === 0) {
			this._svg.insert("g", ":first-child").classed("ts-render", true);
		}
		this._t_points.forEach(p => p.remove())
		this._t_points = []
		this._r = this._svg.select("g.ts-render");
		const _this = this
		this._r.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("opacity", 0)
			.on("click", function() {
				const m = d3.mouse(this)
				setTimeout(() => {
					_this.render_points(m)
				}, 0)
			})
		this._r.append("path")
			.attr("stroke", "black")
			.attr("fill-opacity", 0)
			.style("pointer-events", "none")
		this.render_points()

		const svgNode = this._svg.node();
		this._svg.selectAll("g:not(.ts-render)").filter(function() {
			return this.parentNode === svgNode
		}).style("visibility", "hidden");
	}

	render_points(m) {
		const line = d3.line().x(d => d[0]).y(d => d[1])
		const path = []
		this._t_points.forEach(p => p.remove())
		const pn = this._points.length
		const n = pn + this._pred.length
		if (m && pn > Math.max(1, this._t_points.length - this._pred.length)) {
			const dx = this.width / (n - 1)
			const idx = Math.min(pn - 1, Math.round(m[0] / dx))
			const p = this._points.pop()
			this._points.splice(idx, 0, p)
		}
		this._t_points = []
		const dx = this.width / n
		for (let i = 0; i < pn; i++) {
			const x = dx * (i + 0.5);
			const a = [x, this._points[i].at[1]]
			const p = new DataPoint(this._r, a, this._points[i].category)
			this._t_points.push(p)
			path.push(a)
		}
		for (let i = pn; i < n; i++) {
			const x = dx * (i + 0.5);
			const a = [x, this._pred[i - pn]]
			const p = new DataPoint(this._r, a, specialCategory.dummy)
			this._t_points.push(p)
			path.push(a)
		}
		if (path.length === 0) {
			this._r.select("path").attr("opacity", 0)
		} else {
			this._r.select("path")
				.attr("d", line(path))
				.attr("opacity", 0.8)
		}
	}

	plot(fit_cb, scale = 1000) {
		fit_cb(this._points.map(v => v.at[1] / scale), this._points.map(v => v.category), null, (pred) => {
			this._pred = pred.map(v => v * scale);
			this.render_points()
		})
	}

	clean() {
		this._r.remove();
		this._svg.selectAll("g").style("visibility", null);
	}

	close() {
		this.clean();
	}
}

