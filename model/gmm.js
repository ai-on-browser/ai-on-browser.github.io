class GMM {
	// see https://www.slideshare.net/TakayukiYagi1/em-66114496
	// Anomaly detection https://towardsdatascience.com/understanding-anomaly-detection-in-python-using-gaussian-mixture-model-e26e5d06094b
	//                   A Survey of Outlier Detection Methodologies. (2004)
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
		const s = Matrix.randn(this._d, this._d);
		this._s.push(s.tDot(s));
	}

	clear() {
		this._k = 0;
		this._p = [];
		this._m = [];
		this._s = [];
	}

	probability(data) {
		return data.map(v => {
			const x = new Matrix(this._d, 1, v);
			const prob = [];
			for (let i = 0; i < this._k; i++) {
				const v = this._gaussian(x, this._m[i], this._s[i]) * this._p[i];
				prob.push(v);
			}
			return prob;
		})
	}

	predict(data) {
		return data.map(v => {
			const x = new Matrix(this._d, 1, v);
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
		const xs = x.copySub(m);
		return Math.exp(-0.5 * xs.tDot(s.inv()).dot(xs).value[0]) / (Math.sqrt(2 * Math.PI) ** this._d * Math.sqrt(s.det()));
	}

	fit(datas) {
		const n = datas.length;
		const g = [];
		const N = Array(this._k).fill(0);
		const x = [];
		datas.forEach((data, i) => {
			const ns = [];
			let s = 0;
			const xi = new Matrix(this._d, 1, data);
			for (let j = 0; j < this._k; j++) {
				const v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j];
				ns.push(v || 0);
				s += v || 0;
			}
			const gi = ns.map(v => v / (s || 1.0));
			g.push(gi);
			x.push(xi);
			gi.forEach((v, j) => N[j] += v);
		});

		for(let i = 0; i < this._k; i++) {
			const new_mi = new Matrix(this._d, 1);
			for (let j = 0; j < n; j++) {
				new_mi.add(x[j].copyMult(g[j][i]));
			}
			new_mi.div(N[i]);
			this._m[i] = new_mi;

			const new_si = new Matrix(this._d, this._d);
			for (let j = 0; j < n; j++) {
				let tt = x[j].copySub(new_mi);
				tt = tt.dot(tt.t);
				tt.mult(g[j][i]);
				new_si.add(tt);
			}
			new_si.div(N[i]);
			new_si.add(Matrix.eye(this._d, this._d, 1.0e-8))
			this._s[i] = new_si;

			this._p[i] = N[i] / n;
		}
	}
}

class GMMPlotter {
	// see http://d.hatena.ne.jp/natsutan/20110421/1303344155
	constructor(svg, grayscale = false) {
		this._r = svg.append("g").attr("class", "centroids");
		this._model = new GMM(2);
		this._size = 0;
		this._center = [];
		this._circle = [];
		this._isLoop = false;
		this._grayscale = grayscale;
		this._scale = 1000;
		this._duration = 200;
	}

	terminate() {
		this._r.remove();
		this.stopLoop()
	}

	fitLoop(datas, cb) {
		this._isLoop = true;
		(function stepLoop(m, d) {
			if (m._isLoop) {
				m.fit(d.x);
				m.predict(d);
				cb && cb();
				setTimeout(() => stepLoop(m, d), m._duration);
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
		let t = 360 * Math.atan((su2 - s[0]) / s[1]) / (2 * Math.PI);
		if (isNaN(t)) {
			t = 0
		}

		ell.attr("rx", c * Math.sqrt(su2) * this._scale)
			.attr("ry", c * Math.sqrt(sv2) * this._scale)
			.attr("transform", "translate(" + (cn[0] * this._scale) + "," + (cn[1] * this._scale) + ") " + "rotate(" + t + ")");
	}

	add() {
		this._model.add();
		this._size++;
		let cn = this._model._m[this._size - 1].value;
		let dp = new DataPoint(this._r, [cn[0] * this._scale, cn[1] * this._scale], this._grayscale ? 0 : this._size);
		dp.plotter(DataPointStarPlotter);
		this._center.push(dp);

		let cecl = this._r.append("ellipse")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("stroke", this._grayscale ? "gray" : getCategoryColor(this._size))
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

	_scale_data(datas) {
		return datas.map(p => [p[0] / this._scale, p[1] / this._scale]);
	}

	predict(datas) {
		if (this._center.length == 0) {
			return;
		}
		const dp = this._scale_data(datas.x);
		this._model.predict(dp).forEach((p, i) => {
			datas.at(i).y = this._center[p].category;
		});
	}

	fit(datas) {
		const dp = this._scale_data(datas)
		this._model.fit(dp);
		this._center.forEach((c, i) => {
			let cn = this._model._m[i].value;
			c.move([cn[0] * this._scale, cn[1] * this._scale], this._duration);
		});
		this._circle.forEach((ecl, i) => {
			this._set_el_attr(ecl.transition().duration(this._duration), i);
		});
	}

	probability(data) {
		return this._model.probability(data.map(p => [p[0] / this._scale, p[1] / this._scale]));
	}
}

var dispGMM = function(elm, platform) {
	const svg = platform.svg;
	const mode = platform.task

	const grayscale = mode !== 'CT'
	let model = new GMMPlotter(svg, grayscale);
	let fitModel = (doFit, cb) => {
		if (mode === 'AD') {
			platform.plot((tx, ty, px, pred_cb) => {
				const threshold = +elm.select("[name=threshold]").property("value")
				if (doFit) model.fit(tx);
				const outliers = model.probability(tx).map(v => {
					return 1 - v.reduce((a, v) => a * Math.exp(-v), 1) < threshold;
				});
				const outlier_tiles = model.probability(px).map(v => {
					return 1 - v.reduce((a, v) => a * Math.exp(-v), 1) < threshold;
				});
				pred_cb(outliers, outlier_tiles)
			}, 3, 1)
		} else if (mode === 'DE') {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					if (doFit) model.fit(tx)
					const pred = model.probability(px).map(p => Math.max(...p))
					const min = Math.min(...pred);
					const max = Math.max(...pred);
					pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
				}, 8, 1
			)
		} else {
			if (doFit) {
				model.fit(platform.datas.x);
			}
			model.predict(platform.datas);
		}
		elm.select("[name=clusternumber]")
			.text(model._size + " clusters");
	}
	let isRunning = false;

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Add cluster")
		.on("click", () => {
			model.add();
			fitModel(false);
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	if (mode === 'AD') {
		elm.append("span")
			.text(" threshold = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "threshold")
			.attr("value", 0.5)
			.attr("min", 0)
			.attr("max", 1)
			.property("required", true)
			.attr("step", 0.1)
			.on("change", () => fitModel(false));
	}
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (model == null) {
				return;
			}
			fitModel(true);
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (grayscale) {
				if (isRunning) {
					(function stepLoop() {
						if (isRunning) {
							fitModel(true);
							setTimeout(stepLoop, 0);
						}
					})();
				}
			} else {
				if (isRunning) {
					model.fitLoop(platform.datas, () => {
					});
				} else {
					model.stopLoop();
				}
			}
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Clear")
		.on("click", () => {
			model && model.clear()
			elm.select("[name=clusternumber]")
				.text("0 clusters");
			platform.init()
		});
	return () => {
		isRunning = false;
		model.terminate();
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispGMM(platform.setting.ml.configElement, platform);
}
