class GMM {
	// see https://www.slideshare.net/TakayukiYagi1/em-66114496
	// Anomaly detection https://towardsdatascience.com/understanding-anomaly-detection-in-python-using-gaussian-mixture-model-e26e5d06094b
	//                   A Survey of Outlier Detection Methodologies. (2004)
	constructor() {
		this._k = 0;
		this._d = null;
		this._p = [];
		this._m = [];
		this._s = [];
	}

	_init(datas) {
		if (!this._d) {
			this._d = datas[0].length
			for (let i = 0; i < this._k; i++) {
				this.add()
				this._k--
			}
		}
	}

	add() {
		this._k++;
		if (this._d) {
			this._p.push(Math.random());
			this._m.push(Matrix.random(this._d, 1));
			const s = Matrix.randn(this._d, this._d);
			this._s.push(s.tDot(s));
		}
	}

	clear() {
		this._k = 0;
		this._p = [];
		this._m = [];
		this._s = [];
	}

	probability(data) {
		this._init(data)
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
		this._init(data)
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
		this._init(datas)
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

class SemiSupervisedGMM extends GMM {
	// http://yamaguchiyuto.hatenablog.com/entry/machine-learning-advent-calendar-2014
	constructor() {
		super()
	}

	init(datas, labels) {
		this.clear()
		this._init(datas)
		const classes = [...new Set(labels.filter(v => v > 0))]
		for (let k = 0; k < classes.length; k++) {
			super.add()
		}
	}

	add() {}

	fit(datas, y) {
		this._init(datas)
		const n = datas.length;
		const g = [];
		const N = Array(this._k).fill(0);
		const x = [];
		datas.forEach((data, i) => {
			const ns = [];
			let s = 0;
			const xi = new Matrix(this._d, 1, data);
			for (let j = 0; j < this._k; j++) {
				let v = 0
				if (y[i] === 0) {
					v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j];
				} else {
					v = y[i] === j + 1 ? 1 : 0
				}
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

class GMR extends GMM {
	// https://datachemeng.com/gaussianmixtureregression/
	constructor() {
		super()
		this._input_d = 0
		this._mx = []
		this._my = []
		this._sxx = []
		this._sxy = []
	}

	add() {
		super.add()
		if (this._mx.length < this._m.length) {
			for (let i = this._mx.length; i < this._m.length; i++) {
				this._mx[i] = this._m[i].sliceRow(0, this._input_d)
				this._my[i] = this._m[i].sliceRow(this._input_d)
				this._sxx[i] = this._s[i].slice(0, 0, this._input_d, this._input_d)
				this._sxy[i] = this._s[i].slice(this._input_d, 0, null, this._input_d)
			}
		}
	}

	clear() {
		super.clear()
		this._mx = []
		this._my = []
		this._sxx = []
		this._sxy = []
	}

	fit(x, y) {
		this._input_d = x[0].length
		const datas = x.map((v, i) => v.concat(y[i]))
		super.fit(datas)

		this._mx = this._m.map(m => m.sliceRow(0, this._input_d))
		this._my = this._m.map(m => m.sliceRow(this._input_d))
		this._sxx = this._s.map(m => m.slice(0, 0, this._input_d, this._input_d))
		this._sxy = this._s.map(m => m.slice(0, this._input_d, this._input_d, null))
	}

	probability(x, y) {
		const datas = x.map((v, i) => v.concat(y[i]))
		return super.probability(datas)
	}

	predict(x) {
		if (this._mx.length === 0) {
			return []
		}
		x = Matrix.fromArray(x)
		const w = new Matrix(x.rows, this._k)
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i).t
			for (let k = 0; k < this._k; k++) {
				const v = this._gaussian(xi, this._mx[k], this._sxx[k]) * this._p[k]
				w.set(i, k, v)
			}
		}
		w.div(w.sum(1))

		const ys = new Matrix(x.rows, this._my[0].cols)
		for (let k = 0; k < this._k; k++) {
			const c = x.copySub(this._mx[k].t).dot(this._sxx[k].inv()).dot(this._sxy[k])
			c.add(this._my[k])
			c.mult(w.col(k))
			ys.add(c)
		}
		return ys.toArray()
	}
}

class GMMPlotter {
	// see http://d.hatena.ne.jp/natsutan/20110421/1303344155
	constructor(svg, grayscale = false) {
		this._r = svg.append("g").attr("class", "centroids2");
		this._model = new GMM();
		this._size = 0;
		this._circle = [];
		this._grayscale = grayscale;
		this._duration = 200;
	}

	terminate() {
		this._r.remove();
	}

	_set_el_attr(ell, i) {
		if (!this._model._m[i]) {
			return
		}
		let cn = this._model._m[i].value;
		let s = this._model._s[i].value;
		const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2;
		const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2;
		const c = 2.146;
		let t = 360 * Math.atan((su2 - s[0]) / s[1]) / (2 * Math.PI);
		if (isNaN(t)) {
			t = 0
		}

		ell.attr("rx", c * Math.sqrt(su2) * 1000)
			.attr("ry", c * Math.sqrt(sv2) * 1000)
			.attr("transform", "translate(" + (cn[0] * 1000) + "," + (cn[1] * 1000) + ") " + "rotate(" + t + ")");
	}

	add() {
		this._model.add();
		this._size++;

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
		this._circle.forEach(c => c.remove());
		this._circle = [];
		this._size = 0;
	}

	predict(data) {
		if (this._circle.length == 0) {
			return;
		}
		return this._model.predict(data).map(v => v + 1)
	}

	fit(datas, y) {
		this._model.fit(datas, y);
		this._circle.forEach((ecl, i) => {
			this._set_el_attr(ecl.transition().duration(this._duration), i);
		});
	}

	probability(data) {
		return this._model.probability(data);
	}
}

var dispGMM = function(elm, platform) {
	const svg = platform.svg;
	const mode = platform.task

	const grayscale = mode !== 'CT' && mode !== 'SC' && mode !== 'RG'
	let model = new GMMPlotter(svg, grayscale);
	if (mode === 'SC') {
		model._model = new SemiSupervisedGMM()
	} else if (mode === 'RG') {
		model = new GMR()
	}
	let fitModel = (doFit, cb) => {
		if (mode === 'AD') {
			platform.fit((tx, ty, fit_cb) => {
				const threshold = +elm.select("[name=threshold]").property("value")
				if (doFit) model.fit(tx);
				const outliers = model.probability(tx).map(v => {
					return 1 - v.reduce((a, v) => a * Math.exp(-v), 1) < threshold;
				});
				fit_cb(outliers)
				platform.predict((px, pred_cb) => {
					const outlier_tiles = model.probability(px).map(v => {
						return 1 - v.reduce((a, v) => a * Math.exp(-v), 1) < threshold;
					});
					pred_cb(outlier_tiles)
				}, 3)
			})
		} else if (mode === 'DE') {
			platform.fit((tx, ty) => {
				if (doFit) model.fit(tx)
				platform.predict((px, pred_cb) => {
					const pred = model.probability(px).map(p => Math.max(...p))
					const min = Math.min(...pred);
					const max = Math.max(...pred);
					pred_cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
				}, 8)
			})
		} else if (mode === 'SC') {
			platform.fit((tx, ty, fit_cb) => {
				if (doFit) model.fit(tx, ty.map(v => v[0]))
				fit_cb(model.predict(tx))
				platform.predict((px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				}, 4)
			})
		} else if (mode === 'GR') {
			platform.fit((tx, ty, fit_cb) => {
				if (doFit) model.fit(tx)
				const p = []
				if (model._size > 0) {
					for (let i = 0; i < tx.length; i++) {
						let r = Math.random()
						let k = 0
						for (; k < model._model._p.length; k++) {
							if ((r -= model._model._p[k]) <= 0) {
								break
							}
						}
						p.push(Matrix.randn(1, tx[0].length, model._model._m[k], model._model._s[k]).value)
					}
				}
				fit_cb(p)
			})
		} else if (mode === 'RG') {
			platform.fit((tx, ty) => {
				if (doFit) {
					model.fit(tx, ty)
					platform.predict((px, pred_cb) => {
						const pred = model.predict(px)
						pred_cb(pred)
					}, 4)
				}
			})
		} else {
			platform.fit((tx, ty, fit_cb) => {
				if (doFit) model.fit(tx)
				fit_cb(model.predict(tx))
			})
		}
		if (mode === 'RG') {
			elm.select("[name=clusternumber]")
				.text(model._k + " clusters");
		} else {
			platform.centroids(model._model._m.map(m => m.value), grayscale ? 0 : model._model._m.map((m, i) => i + 1), {duration: 200})
			elm.select("[name=clusternumber]")
				.text(model._size + " clusters");
		}
	}

	const slbConf = platform.setting.ml.controller.stepLoopButtons()
	if (mode === 'SC') {
		slbConf.init(() => {
			platform.fit((tx, ty) => {
				model.clear()
				model._model.init(tx, ty.map(v => v[0]))
				for (let k = 0; k < model._model._k; k++) {
					model.add()
				}
				fitModel(false)
			})
		})
	} else {
		elm.append("input")
			.attr("type", "button")
			.attr("value", "Add cluster")
			.on("click", () => {
				model.add();
				fitModel(false);
			});
	}
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
	slbConf.step(cb => {
		fitModel(true);
		setTimeout(() => cb && cb(), 200);
	})
	if (mode !== 'SC') {
		elm.append("input")
			.attr("type", "button")
			.attr("value", "Clear")
			.on("click", () => {
				model && model.clear()
				elm.select("[name=clusternumber]")
					.text("0 clusters");
				platform.init()
			});
	}
	return () => {
		if (mode !== 'RG') {
			model.terminate();
		}
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispGMM(platform.setting.ml.configElement, platform);
}
