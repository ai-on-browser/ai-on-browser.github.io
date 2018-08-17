class GMM {
	// see https://www.slideshare.net/TakayukiYagi1/em-66114496
	constructor(d) {
		this._k = 0;
		this._d = d;
		this._p = [];
		this._m = [];
		this._s = [];
	}

	add() {
		this._k++;
		this._p.push(Math.random());
		this._m.push(Matrix.random(this._d, 1));
		let s = Matrix.randn(this._d, this._d);
		this._s.push(s.tDot(s));
	}

	clear() {
		this._k = 0;
		this._p = [];
		this._m = [];
		this._s = [];
	}

	predict(data) {
		return data.map(v => {
			let x = new Matrix(this._d, 1, v);
			let max_p = 0;
			let max_c = -1;
			for (let i = 0; i < this._k; i++) {
				let v = this._gaussian(x, this._m[i], this._s[i]);
				if (v > max_p) {
					max_p = v;
					max_c = i;
				}
			}
			return max_c;
		});
	}

	_gaussian(x, m, s) {
		let xs = x.copySub(m);
		return Math.exp(xs.tDot(s.inv()).dot(xs).value[0] / (-2)) / (Math.sqrt(2 * Math.PI) ** this._d * Math.sqrt(s.det()));
	}

	fit(datas) {
		const n = datas.length;
		let g = [];
		let N = Array(this._k).fill(0);
		let x = [];
		datas.forEach((data, i) => {
			let ns = [];
			let s = 0;
			let xi = new Matrix(this._d, 1, data);
			for (let j = 0; j < this._k; j++) {
				let v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j];
				ns.push(v || 0);
				s += v || 0;
			}
			let gi = this._p.map((p, j) => ns[j] / (s || 1.0));
			g.push(gi);
			x.push(xi);
			gi.forEach((v, j) => N[j] += v);
		});

		let new_m = [];
		for(let i = 0; i < this._k; i++) {
			let new_mi = new Matrix(this._d, 1);
			for (let j = 0; j < n; j++) {
				new_mi.add(x[j].copyMult(g[j][i]));
			}
			new_mi.div(N[i]);
			this._m[i] = new_mi;

			let new_si = new Matrix(this._d, this._d);
			for (let j = 0; j < n; j++) {
				let tt = x[j].copySub(new_mi);
				tt = tt.dot(tt.t);
				tt.mult(g[j][i]);
				new_si.add(tt);
			}
			new_si.div(N[i]);
			this._s[i] = new_si;

			this._p[i] = N[i] / n;
		}
	}
}

class GMMPlotter {
	// see http://d.hatena.ne.jp/natsutan/20110421/1303344155
	constructor(r) {
		this._r = r;
		this._model = new GMM(2);
		this._size = 0;
		this._center = [];
		this._circle = [];
		this._isLoop = false;
		this._scale = 1000;
	}

	fitLoop(datas, cb) {
		this._isLoop = true;
		(function stepLoop(m, d) {
			if (m._isLoop) {
				m.fit(d);
				cb && cb();
				setTimeout(() => stepLoop(m, d), 200);
			}
		})(this, datas);
	}

	stopLoop() {
		this._isLoop = false;
	}

	_set_el_attr(ell, i) {
		let cn = this._model._m[i].value;
		let s = this._model._s[i].value;
		const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2;
		const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2;
		const c = 2.146;
		const t = 360 * Math.atan((su2 - s[0]) / s[1]) / (2 * Math.PI);

		ell.attr("rx", c * Math.sqrt(su2) * this._scale)
			.attr("ry", c * Math.sqrt(sv2) * this._scale)
			.attr("transform", "translate(" + (cn[0] * this._scale) + "," + (cn[1] * this._scale) + ") " + "rotate(" + t + ")");
	}

	add() {
		this._model.add();
		this._size++;
		let cn = this._model._m[this._size - 1].value;
		let dp = new DataPoint(this._r, [cn[0] * this._scale, cn[1] * this._scale], this._size);
		dp.plotter(DataPointStarPlotter);
		this._center.push(dp);

		let cecl = this._r.append("ellipse")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("stroke", getCategoryColor(this._size))
			.attr("stroke-width", 2)
			.attr("fill-opacity", 0);
		this._set_el_attr(cecl, this._size - 1);
		this._circle.push(cecl);
	}

	clear() {
		this._model.clear();
		this._center.forEach(c => c.remove());
		this._center = [];
		this._circle.forEach(c => c.remove());
		this._circle = [];
		this._size = 0;
	}

	predict(datas) {
		if (this._center.length == 0) {
			return;
		}
		let dp = datas.map(p => [p.at[0] / this._scale, p.at[1] / this._scale]);
		this._model.predict(dp).forEach((p, i) => {
			datas[i].category = this._center[p].category;
		});
	}

	fit(datas) {
		let dp = datas.map(p => [p.at[0] / this._scale, p.at[1] / this._scale]);
		this._model.fit(dp);
		this._center.forEach((c, i) => {
			let cn = this._model._m[i].value;
			c.move([cn[0] * this._scale, cn[1] * this._scale], 200);
		});
		this._circle.forEach((ecl, i) => {
			this._set_el_attr(ecl.transition().duration(200), i);
		});

		this.predict(datas);
	}
}

var dispGMM = function(elm) {
	const svg = d3.select("svg");

	svg.append("g").attr("class", "centroids");
	let model = new GMMPlotter(svg.select(".centroids"));
	let isRunning = false;

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Add cluster")
		.on("click", () => {
			model.add();
			model.predict(points);
			elm.select(".buttons [name=clusternumber]")
				.text(model._size + " clusters");
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (model == null) {
				return;
			}
			model.fit(points);
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				model.fitLoop(points, () => {
				});
			} else {
				model.stopLoop();
			}
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Clear")
		.on("click", () => {
			model && model.clear()
			elm.select(".buttons [name=clusternumber]")
				.text(model._size + " clusters");
		});
	return () => {
		isRunning = false;
		model.stopLoop();
	}
}


var gmm_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Finally, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispGMM(root);

	terminateSetter(() => {
		d3.selectAll("svg .centroids").remove();
		termCallback();
	});
}
