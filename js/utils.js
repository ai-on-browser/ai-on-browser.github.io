class BaseWorker {
	constructor(worker_file) {
		this._worker = new Worker(worker_file);
	}

	_postMessage(data, cb) {
		if (cb) {
			const event_cb = (e) => {
				this._worker.removeEventListener('message', event_cb, false);
				cb(e);
			}
			this._worker.addEventListener('message', event_cb, false);
		}
		this._worker.postMessage(data);
	}

	terminate() {
		this._worker.terminate();
	}
}

class DataPointCirclePlotter {
	constructor(svg, item) {
		this._svg = svg;
		this.item = item || this._svg.append("circle");
	}

	attr(name, value) {
		return (value) ? (this.item.attr(name, value) && this) : this.item.attr(name);
	}

	cx(value) {
		return this.attr("cx", value);
	}

	cy(value) {
		return this.attr("cy", value);
	}

	color(value) {
		return this.attr("fill", value);
	}

	radius(value) {
		return this.attr("r", value);
	}

	title(value) {
		this.item.selectAll("*").remove()
		if (value && value !== "") {
			this.item.append("title").text(value)
		}
		return this
	}

	transition() {
		return new DataPointCirclePlotter(this._svg, this.item.transition());
	}

	duration(value) {
		return new DataPointCirclePlotter(this._svg, this.item.duration(value));
	}

	remove() {
		return this.item.remove();
	}
}

class DataPointStarPlotter {
	constructor(svg, item, polygon) {
		this._svg = svg;
		this._c = [0, 0];
		this._r = 5;
		if (item) {
			this.g = item;
			this.polygon = polygon;
		} else {
			this.g = this._svg.append("g");
			this.polygon = this.g.append("polygon");
			this.polygon.attr("points", this._path())
				.attr("stroke", d3.rgb(0, 0, 0));
		}
	}

	_path() {
		return [
			[-Math.sin(Math.PI * 2 / 5), -Math.cos(Math.PI * 2 / 5)],
			[-Math.sin(Math.PI / 5) / 2, -Math.cos(Math.PI / 5) / 2],
			[0, -1],
			[Math.sin(Math.PI / 5) / 2, -Math.cos(Math.PI / 5) / 2],
			[Math.sin(Math.PI * 2 / 5), -Math.cos(Math.PI * 2 / 5)],
			[Math.sin(Math.PI * 3 / 5) / 2, -Math.cos(Math.PI * 3 / 5) / 2],
			[Math.sin(Math.PI * 4 / 5), -Math.cos(Math.PI * 4 / 5)],
			[0, 1 / 2],
			[-Math.sin(Math.PI * 4 / 5), -Math.cos(Math.PI * 4 / 5)],
			[-Math.sin(Math.PI * 3 / 5) / 2, -Math.cos(Math.PI * 3 / 5) / 2]
		].reduce((acc, v) => acc + (v[0] * this._r) + "," + (v[1] * this._r) + " ", "");
	}

	cx(value) {
		this._c[0] = value || this._c[0];
		return (value) ? (this.g.attr("transform", "translate(" + this._c[0] + ", " + this._c[1] + ")") && this) : this._c[0];
	}

	cy(value) {
		this._c[1] = value || this._c[1];
		return (value) ? (this.g.attr("transform", "translate(" + this._c[0] + ", " + this._c[1] + ")") && this) : this._c[1];
	}

	color(value) {
		return (value) ? (this.polygon.attr("fill", value) && this) : this.polygon.attr("fill");
	}

	radius(value) {
		this._r = value || this._r;
		return (value) ? (this.polygon.attr("points", this._path()) && this) : this._r;
	}

	title(value) {
		this.polygon.selectAll("*").remove()
		if (value && value !== "") {
			this.polygon.append("title").text(value)
		}
		return this
	}

	transition() {
		return new DataPointStarPlotter(this._svg, this.g.transition(), this.polygon.transition());
	}

	duration(value) {
		return new DataPointStarPlotter(this._svg, this.g.duration(value), this.polygon.duration(value));
	}

	remove() {
		return this.g.remove();
	}
}

class DataVector {
	constructor(value) {
		this.value = (value instanceof DataVector) ? value.value : value;
	}

	get length() {
		return Math.sqrt(this.value.reduce((acc, v) => acc + v * v, 0));
	}

	map(func) {
		return new DataVector(this.value.map(func));
	}

	reduce(func, init) {
		return this.value.reduce(func, init);
	}

	add(p) {
		return this.map((v, i) => v + p.value[i]);
	}

	sub(p) {
		return this.map((v, i) => v - p.value[i]);
	}

	mult(n) {
		return this.map(v => v * n);
	}

	div(n) {
		return this.map(v => v / n);
	}

	dot(p) {
		return this.value.reduce((acc, v, i) => acc + v * p.value[i], 0);
	}

	distance(p) {
		return Math.sqrt(this.value.reduce((acc, v, i) => acc + (v - p.value[i]) ** 2, 0));
	}

	angleCos(p) {
		return this.dot(p) / (this.length * p.length);
	}

	equals(p) {
		return this.value.every((v, i) => v == p.value[i]);
	}
}

const categoryColors = {
	"-2": d3.rgb(255, 0, 0),
	"-1": d3.rgb(255, 255, 255),
	"0": d3.rgb(0, 0, 0),
};

const specialCategory = {
	error: -2,
	errorRate: (r) => -1 - r,
	dummy: -2,
	density: (d) => -1 + d,
	never: -3
};

const getCategoryColor = function(i) {
	if (isNaN(i)) {
		return categoryColors["0"];
	}
	if (i != Math.floor(i)) {
		let clr_l = getCategoryColor(Math.floor(i));
		let clr_h = getCategoryColor(Math.ceil(i));
		let r = i - Math.floor(i);
		return d3.rgb(Math.round(clr_l.r + (clr_h.r - clr_l.r) * r), Math.round(clr_l.g + (clr_h.g - clr_l.g) * r), Math.round(clr_l.b + (clr_h.b - clr_l.b) * r));
	}
	i = i % 1000;
	if (!categoryColors[i]) {
		let cnt = 0;
		while (true) {
			cnt += 1;
			let d = [Math.random(), Math.random(), Math.random()];
			let min_dis = -1;
			for (let k of Object.keys(categoryColors)) {
				if (+k < 0 || Math.abs(+k - i) > 10) {
					continue;
				}
				let dis = (d[0] - categoryColors[k].r / 256) ** 2 + (d[1] - categoryColors[k].g / 256) ** 2 + (d[2] - categoryColors[k].b / 256) ** 2;
				if (min_dis == -1 || dis < min_dis) {
					min_dis = dis;
				}
			}
			if (Math.random() < Math.sqrt(min_dis) || cnt > 200) {
				categoryColors[i] = d3.rgb(Math.floor(d[0] * 225), Math.floor(d[1] * 225), Math.floor(d[2] * 225));
				break;
			}
		}
	}
	return categoryColors[i];
};

class DataPoint {
	constructor(svg, position = [0, 0], category = 0) {
		this.svg = svg;
		this.vector = new DataVector(position);
		this._color = getCategoryColor(category);
		this._category = category;
		this._radius = 5;
		this._plotter = new DataPointCirclePlotter(svg);
		this._binds = [];
		this.display();
	}

	display() {
		this._plotter.cx('' + this.vector.value[0])
			.cy('' + this.vector.value[1])
			.radius(this._radius)
			.color(this._color);
		this._binds.forEach(e => e.display());
	}

	get item() {
		return this._plotter.item;
	}

	get at() {
		return this.vector.value;
	}
	set at(position) {
		this.vector = new DataVector(position);
		this.display();
	}
	get color() {
		return this._color;
	}
	get category() {
		return this._category;
	}
	set category(category) {
		this._category = category;
		this._color = getCategoryColor(category);
		this.display();
	}
	get radius() {
		return this._radius;
	}
	set radius(radius) {
		this._radius = radius;
		this.display();
	}
	set title(value) {
		this._plotter.title(value)
	}

	plotter(plt) {
		this._plotter.remove();
		this._plotter = new plt(this.svg);
		this.display();
	}

	remove() {
		this._plotter.remove();
		this._binds.forEach(e => e.remove());
	}

	move(to, duration = 1000) {
		this.vector = new DataVector(to);
		this._plotter.transition()
			.duration(duration)
			.cx(this.vector.value[0])
			.cy(this.vector.value[1]);
		this._binds.forEach(e => e.move(duration));
	}

	distance(p) {
		return this.vector.distance(p.vector);
	}

	bind(e) {
		this._binds.push(e);
	}

	removeBind(e) {
		this._binds = this._binds.filter(b => b !== e);
	}

	static sum(arr) {
		return (arr.length == 0) ? [] : arr.slice(1).reduce((acc, v) => acc.add(v.vector), arr[0].vector);
	}
	static mean(arr) {
		return (arr.length == 0) ? [] : DataPoint.sum(arr).div(arr.length);
	}
}

class DataCircle {
	constructor(svg, at) {
		this._svg = svg;
		this.item = svg.append("circle").attr("fill-opacity", 0);
		this._at = at;
		this._color = null;
		this._width = 4;
		at.bind(this);
		this.display();
	}

	get color() {
		return this._color || this._at.color;
	}
	set color(value) {
		this._color = value;
		this.display();
	}

	set title(value) {
		this.item.selectAll("*").remove()
		if (value && value.length > 0) {
			this.item.append("title").text(value)
		}
	}

	display() {
		this.item
			.attr("cx", this._at.at[0])
			.attr("cy", this._at.at[1])
			.attr("stroke", this.color)
			.attr("stroke-width", this._width)
			.attr("r", this._at._radius);
	}

	move(duration = 1000) {
		this.item.transition()
			.duration(duration)
			.attr("cx", this._at.at[0])
			.attr("cy", this._at.at[1]);
	}

	remove() {
		this.item.remove();
		this._at.removeBind(this);
	}
}

class DataLine {
	constructor(svg, from, to) {
		this._svg = svg;
		this.item = svg.append("line");
		this._from = from;
		this._to = to;
		this._remove_listener = null;
		from && from.bind(this);
		to && to.bind(this);
		this.display();
	}

	set from(value) {
		this._from && this._from.removeBind(this);
		this._from = value;
		this._from.bind(this);
	}

	set to(value) {
		this._to && this._to.removeBind(this);
		this._to = value;
		this._to.bind(this);
	}

	display() {
		if (!this._from || !this._to) return;
		this.item
			.attr("x1", this._from.at[0])
			.attr("y1", this._from.at[1])
			.attr("x2", this._to.at[0])
			.attr("y2", this._to.at[1])
			.attr("stroke", this._from.color);
	}

	move(duration = 1000) {
		if (!this._from || !this._to) return;
		this.item.transition()
			.duration(duration)
			.attr("x1", this._from.at[0])
			.attr("y1", this._from.at[1])
			.attr("x2", this._to.at[0])
			.attr("y2", this._to.at[1]);
	}

	remove() {
		this.item.remove();
		this._from && this._from.removeBind(this);
		this._from = null;
		this._to && this._to.removeBind(this);
		this._to = null;
		this._remove_listener && this._remove_listener(this);
	}

	setRemoveListener(cb) {
		this._remove_listener = cb;
	}
}

class DataConvexHull {
	constructor(svg, points) {
		this._svg = svg;
		this.item = svg.append("polygon");
		this._points = points;
		this.display();
	}

	_argmin(arr, key) {
		if (arr.length == 0) {
			return -1
		}
		arr = key ? arr.map(key) : arr
		return arr.indexOf(Math.min(...arr))
	}

	_convexPoints() {
		if (this._points.length <= 3) {
			return this._points;
		}
		let cp = [].concat(this._points);
		let basei = this._argmin(cp, p => p.at[1]);
		const base = cp.splice(basei, 1)[0];
		cp.sort((a, b) => {
			let dva = a.vector.sub(base.vector);
			let dvb = b.vector.sub(base.vector);
			return dva.value[0] / dva.length - dvb.value[0] / dvb.length;
		});
		let outers = [base];
		for (let k = 0; k < cp.length; k++) {
			while (outers.length >= 3) {
				let n = outers.length;
				const v = outers[n - 1].vector.sub(outers[n - 2].vector).value;
				const newv = cp[k].vector.sub(outers[n - 2].vector).value;
				const basev = base.vector.sub(outers[n - 2].vector).value;
				if ((v[0] * basev[1] - v[1] * basev[0]) * (v[0] * newv[1] - v[1] * newv[0]) > 0) {
					break;
				}
				outers.pop();
			}
			outers.push(cp[k]);
		}
		return outers;
	}

	display() {
		let points = this._convexPoints().reduce((acc, p) => acc + p.at[0] + "," + p.at[1] + " ", "");
		let color = this._points[0].color;
		this.item.attr("points", points)
			.attr("stroke", color)
			.attr("fill", color)
			.attr("opacity", 0.5);
	}

	remove() {
		this.item.remove();
	}
}

class DataMap {
	constructor() {
		this._data = [];
		this._size = [0, 0];
	}

	get rows() {
		return this._size[0];
	}

	get cols() {
		return this._size[1];
	}

	at(x, y) {
		return (x < 0 || !this._data[x] || y < 0) ? undefined : this._data[x][y];
	}

	set(x, y, value) {
		if (!this._data[x]) this._data[x] = [];
		this._data[x][y] = value;
		this._size[0] = Math.max(this._size[0], x + 1);
		this._size[1] = Math.max(this._size[1], y + 1);
	}
}

class DataHulls {
	constructor(svg, categories, tileSize, use_canvas = false, mousemove = null) {
		this._svg = svg;
		this._categories = categories;
		this._tileSize = tileSize;
		if (!Array.isArray(this._tileSize)) {
			this._tileSize = [this._tileSize, this._tileSize]
		}
		this._use_canvas = use_canvas;
		this._mousemove = mousemove;
		this.display();
	}

	display() {
		if (this._use_canvas) {
			let root_svg = d3.select("#plot-area svg");
			let canvas = document.createElement("canvas");
			canvas.width = root_svg.node().getBoundingClientRect().width;
			canvas.height = root_svg.node().getBoundingClientRect().height;
			let ctx = canvas.getContext("2d");
			for (let i = 0; i < this._categories.length; i++) {
				for (let j = 0; j < this._categories[i].length; j++) {
					ctx.fillStyle = getCategoryColor(this._categories[i][j]);
					ctx.fillRect(j * this._tileSize[0], i * this._tileSize[1], this._tileSize[0], this._tileSize[1]);
				}
			}
			let o = this;
			this._svg.append("image")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", canvas.width)
				.attr("height", canvas.height)
				.attr("xlink:href", canvas.toDataURL())
				.on("mousemove", function() {
					const mousePos = d3.mouse(this);
					this._mousemove && this._mousemove(o._categories[Math.round(mousePos[1] / o._tileSize)][Math.round(mousePos[0] / o._tileSize)]);
				});
			return;
		}
		let categories = new DataMap();
		for (let i = 0; i < this._categories.length; i++) {
			for (let j = 0; j < this._categories[i].length; j++) {
				if (this._categories[i][j] === null) {
					categories.set(i, j, null);
				} else {
					categories.set(i, j, Math.round(this._categories[i][j]));
				}
			}
		}
		const invalid = []
		for (let i = 0; i < categories.rows; i++) {
			for (let j = 0; j < categories.cols; j++) {
				if (categories.at(i, j) <= specialCategory.never) {
					continue;
				}
				let targetCategory = categories.at(i, j);
				let targets = new DataMap();
				let hulls = new DataMap();
				let checkTargets = [[i, j]];
				let ignore = false;
				while (checkTargets.length > 0) {
					let [y, x] = checkTargets.pop();
					if (categories.at(y, x) === targetCategory) {
						targets.set(y, x, 1);
						categories.set(y, x, specialCategory.never);
						checkTargets.push([y - 1, x]);
						checkTargets.push([y + 1, x]);
						checkTargets.push([y, x - 1]);
						checkTargets.push([y, x + 1]);
						hulls.set(y, x, (targets.at(y - 1, x) !== 1 && categories.at(y - 1, x) !== targetCategory)
							|| (targets.at(y + 1, x) !== 1 && categories.at(y + 1, x) !== targetCategory)
							|| (targets.at(y, x - 1) !== 1 && categories.at(y, x - 1) !== targetCategory)
							|| (targets.at(y, x + 1) !== 1 && categories.at(y, x + 1) !== targetCategory));
					} else if (categories.at(y, x) === undefined && targetCategory === null) {
						ignore = true;
					}
				}
				if (ignore) continue;
				let hullPoints = [[i, j]];
				let y = i, x = j + 1;
				const max_count = categories.rows * categories.cols;
				let count = 0;
				let ori = "r";
				while (y != i || x != j) {
					let lt = targets.at(y - 1, x - 1);
					let rt = targets.at(y - 1, x);
					let lb = targets.at(y, x - 1);
					let rb = targets.at(y, x);
					if (rt && lt && lb && rb) {
						invalid.push([y, x])
						break;
					} else if (rt && lt && lb) {
						hullPoints.push([y, x]);
						ori = "b";
					} else if (lt && lb && rb) {
						hullPoints.push([y, x]);
						ori = "r";
					} else if (lb && rb && rt) {
						hullPoints.push([y, x]);
						ori = "t";
					} else if (rb && rt && lt) {
						hullPoints.push([y, x]);
						ori = "l";
					} else if (rt && lt) {
						ori = "l";
					} else if (lt && lb) {
						ori = "b";
					} else if (lb && rb) {
						ori = "r";
					} else if (rb && rt) {
						ori = "t";
					} else if (rt && lb) {
						hullPoints.push([y, x]);
						if (ori == "l") {
							ori = "t";
						} else if (ori == "r") {
							ori = "b";
						} else {
							invalid.push([y, x])
						}
					} else if (lt && rb) {
						hullPoints.push([y, x]);
						if (ori == "t") {
							ori = "r";
						} else if (ori == "b") {
							ori = "l";
						} else {
							invalid.push([y, x])
						}
					} else if (rt) {
						hullPoints.push([y, x]);
						ori = "t";
					} else if (lt) {
						hullPoints.push([y, x]);
						ori = "l";
					} else if (lb) {
						hullPoints.push([y, x]);
						ori = "b";
					} else if (rb) {
						hullPoints.push([y, x]);
						ori = "r";
					} else {
						invalid.push([y, x])
						break;
					}
					if (ori == "r") {
						x += 1;
					} else if (ori == "l") {
						x -= 1;
					} else if (ori == "b") {
						y += 1;
					} else if (ori == "t") {
						y -= 1;
					}
					count += 1;
					if (count >= max_count) {
						invalid.push([y, x])
						break;
					}
				}
				this._svg.append("polygon")
					.attr("points", hullPoints.reduce((acc, p) => acc + (p[1] * this._tileSize[1]) + "," + (p[0] * this._tileSize[0]) + " ", ""))
					.attr("fill", targetCategory === null ? d3.rgb(255, 255, 255) : getCategoryColor(targetCategory));
			}
		}

		if (invalid.length > 0) {
			console.log("invalid loop condition at " + JSON.stringify(invalid))
		}
	}
}

