class KNN {
	constructor(k = 5, metric = 'euclid') {
		this._p = [];
		this._c = [];
		this._k = k;

		this._metric = metric
		switch (this._metric) {
		case 'euclid':
			this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
			break
		case 'manhattan':
			this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
			break
		case 'chebyshev':
			this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
			break;
		case 'minkowski':
			this._dp = 2;
			this._d = (a, b) => Math.pow(a.reduce((s, v, i) => s * (v - b[i]) ** this._dp, 0), 1 / this._dp)
			break;
		}
	}

	get k() {
		return this._k;
	}
	set k(value) {
		this._k = value;
	}

	_near_points(data) {
		const ps = [];
		this._p.forEach((p, i) => {
			const d = this._d(data, p);
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop();
				ps.push({
					d: d,
					category: this._c[i],
					idx: i
				});
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d > ps[k].d) {
						[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]];
					}
				}
			}
		});
		return ps;
	}

	add(point, category) {
		this._p.push(point);
		this._c.push(category);
	}

	fit(datas, targets) {
		for (let i = 0; i < datas.length; i++) {
			this.add(datas[i], targets && targets[i])
		}
	}

	predict(data) {
		const ps = this._near_points(data);
		const clss = {};
		ps.forEach(p => {
			let cat = p.category;
			if (!clss[cat]) {
				clss[cat] = {
					count: 1,
					min_d: p.d
				};
			} else {
				clss[cat].count += 1;
				clss[cat].min_d = Math.min(clss[cat].min_d, p.d);
			}
		});
		let max_count = 0;
		let min_dist = -1;
		let target_cat = -1;
		for (let k of Object.keys(clss)) {
			if (max_count < clss[k].count || (max_count == clss[k].count && clss[k].min_d < min_dist)) {
				max_count = clss[k].count;
				min_dist = clss[k].min_d;
				target_cat = +k;
			}
		}
		return target_cat;
	}
}

class KNNRegression extends KNN {
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
	}

	predict(data) {
		const ps = this._near_points(data);
		return ps.reduce((acc, v) => acc + v.category, 0) / ps.length;
	}
}

class KNNAnomaly extends KNN {
	constructor(k = 5, metric = 'euclid') {
		super(k, metric);
	}

	predict(data) {
		const ps = this._near_points(data);
		return ps[ps.length - 1].d;
	}
}

class KNNDensityEstimation extends KNN {
	// https://home.hiroshima-u.ac.jp/tkurita/lecture/prnn/node12.html
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
	}

	_logGamma(z) {
		// https://slpr.sakura.ne.jp/qp/gamma-function/
		let x = 0
		if (Number.isInteger(z)) {
			for (let i = 2; i < z; i++) {
				x += Math.log(i)
			}
		} else {
			const n = z - 0.5
			x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
			for (let i = 2 * n - 1; i > 0; i -= 2) {
				x += Math.log(i)
			}
		}
		return x
	}

	predict(data) {
		const ps = this._near_points(data)
		const r = ps[ps.length - 1].d
		const d = data.length
		const ilogv = this._logGamma(d / 2 + 1) - d / 2 * Math.log(Math.PI) - d * Math.log(r)
		return Math.exp(ilogv) * this.k / this._p.length
	}
}

class SemiSupervisedKNN extends KNN {
	// https://products.sint.co.jp/aisia/blog/vol1-20
	constructor(k = 5, metric = 'euclid') {
		super(k, metric)
		this._k = Infinity
		this._orgk = k
	}

	predict() {
		while (true) {
			const tmpnear = []
			for (let i = 0; i < this._p.length; i++) {
				if (this._c[i] !== 0) {
					let cnt = 0
					const ps = this._near_points(this._p[i])
					for (const p of ps) {
						if (p.category === 0) {
							if (p.d < (tmpnear[p.idx]?.d ?? Infinity)) {
								tmpnear[p.idx] = {
									d: p.d,
									category: this._c[i]
								}
							}
							if (++cnt >= this._orgk) {
								break
							}
						}
					}
				}
			}
			if (tmpnear.length === 0) {
				break
			}
			for (let i = 0; i < this._p.length; i++) {
				if (tmpnear[i]) {
					this._c[i] = tmpnear[i].category
				}
			}
		}
		return this._c
	}
}

var dispKNN = function(elm, platform) {
	const mode = platform.task
	let checkCount = 5;

	const calcKnn = function() {
		const metric = elm.select("[name=metric]").property("value")
		if (mode === 'CF') {
			if (platform.datas.length == 0) {
				return;
			}
			platform.fit((tx, ty) => {
				let model = new KNN(checkCount, metric);
				model.fit(tx, ty.map(v => v[0]))
				platform.predict((px, pred_cb) => {
					const pred = px.map(p => model.predict(p))
					pred_cb(pred)
				}, 4)
			})
		} else if (mode === 'RG') {
			const dim = platform.datas.dimension;
			platform.fit((tx, ty) => {
				let model = new KNNRegression(checkCount, metric);
				model.fit(tx, ty.map(v => v[0]))

				platform.predict((px, pred_cb) => {
					let p = px.map(p => model.predict(p));

					pred_cb(p);
				}, dim === 1 ? 1 : 4)
			});
		} else if (mode === 'AD') {
			platform.fit((tx, ty, cb) => {
				const model = new KNNAnomaly(checkCount + 1, metric);
				model.fit(tx);

				const threshold = +elm.select("[name=threshold]").property("value");
				const outliers = tx.map(p => model.predict(p) > threshold);
				cb(outliers)
			});
		} else if (mode === 'DE') {
			platform.fit((tx, ty) => {
				const model = new KNNDensityEstimation(checkCount + 1, metric);
				model.fit(tx);

				platform.predict((px, cb) => {
					const pred = px.map(p => model.predict(p));
					const min = Math.min(...pred);
					const max = Math.max(...pred);
					cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
				}, 5)
			});
		} else if (mode === 'CP') {
			platform.fit((tx, ty, cb) => {
				const model = new KNNAnomaly(checkCount + 1, metric);
				const d = +elm.select("[name=window]").property("value");
				const data = tx.rolling(d)
				model.fit(data)

				const threshold = +elm.select("[name=threshold]").property("value");
				const pred = data.map(p => model.predict(p))
				for (let i = 0; i < d / 2; i++) {
					pred.unshift(0)
				}
				cb(pred, threshold)
			});
		} else if (mode === 'SC') {
			platform.fit((tx, ty, cb) => {
				const model = new SemiSupervisedKNN(checkCount, metric);
				model.fit(tx, ty.map(v => v[0]))
				cb(model.predict())
			});
		} else if (mode === 'IN') {
			platform.fit((tx, ty) => {
				let model = new KNNRegression(1, "euclid");
				model.fit(tx, ty.map(v => v[0]))

				platform.predict((px, pred_cb) => {
					let p = px.map(p => model.predict(p));

					pred_cb(p);
				}, 1)
			});
		}
	}

	elm.append("select")
		.attr("name", "metric")
		.selectAll("option")
		.data([
			"euclid",
			"manhattan",
			"chebyshev"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	if (mode !== 'IN') {
		elm.append("span")
			.text(" k = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "k")
			.attr("value", checkCount)
			.attr("min", 1)
			.attr("max", 100)
			.property("required", true)
			.on("change", function() {
				checkCount = +elm.select("[name=k]").property("value");
			});
	}
	if (mode === 'CP') {
		elm.append("span")
			.text(" window = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "window")
			.attr("value", 10)
			.attr("min", 1)
			.attr("max", 100)
			.on("change", function() {
				calcKnn();
			});
	}
	if (mode === 'AD' || mode === 'CP') {
		elm.append("span")
			.text(" threshold = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "threshold")
			.attr("value", mode === 'AD' ? 0.05 : 0.4)
			.attr("min", 0.001)
			.attr("max", 10)
			.property("required", true)
			.attr("step", 0.001)
			.on("change", function() {
				calcKnn();
			});
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcKnn);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispKNN(platform.setting.ml.configElement, platform);
}
