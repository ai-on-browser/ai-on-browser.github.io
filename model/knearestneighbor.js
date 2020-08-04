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
					"d": d,
					"category": this._c[i]
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

	predict(data) {
		const ps = this._near_points(data);
		const clss = {};
		ps.forEach(p => {
			let cat = p.category;
			if (!clss[cat]) {
				clss[cat] = {
					"count": 1,
					"min_d": p.d
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
				target_cat = k;
			}
		}
		return target_cat;
	}
}

class KNNRegression extends KNN {
	constructor(k = 5, metric = 'euclid', weight = false) {
		super(k, metric)
		this._weight = weight;
	}

	predict(data) {
		const ps = this._near_points(data);
		if (this._weight) {
			let e = 1.0e-5;
			let s = ps.reduce((acc, v) => acc + 1 / (v.d + e), 0);
			return ps.reduce((acc, v) => acc + v.category / ((v.d + e) * s), 0);
		} else {
			return ps.reduce((acc, v) => acc + v.category, 0) / ps.length;
		}
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

var dispKNN = function(elm, mode, setting) {
	const svg = d3.select("svg");
	const tileLayer = mode === 'CF' && svg.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	let checkCount = 5;
	let weightType = false;

	const calcKnn = function() {
		const metric = elm.select(".buttons [name=metric]").property("value")
		if (mode === 'CF') {
			const tileSize = 4;
			tileLayer.selectAll("*").remove();
			if (points.length == 0) {
				return;
			}
			let model = new KNN(checkCount, metric);
			points.forEach(p => model.add(p.at, p.category));
			let categories = [];
			for (let i = 0; i < height / tileSize; i++) {
				categories[i] = [];
				for (let j = 0; j < width / tileSize; j++) {
					const point = [(j + 0.5) * tileSize, (i + 0.5) * tileSize];
					categories[i][j] = model.predict(point);
				}
			}

			new DataHulls(tileLayer, categories, tileSize);
		} else if (mode === 'RG') {
			const dim = setting.dimension;
			FittingMode.RG(dim).fit(svg, points, dim === 1 ? 1 : 4,
				(tx, ty, px, pred_cb) => {
					let model = new KNNRegression(checkCount, metric, weightType);
					tx.forEach((p, i) => model.add(p, ty[i][0]));

					let p = px.map(p => model.predict(p));

					pred_cb(p);
				}
			);
		} else {
			FittingMode.AD.fit(svg, points, null, (tx, ty, _, cb) => {
				const model = new KNNAnomaly(checkCount + 1, metric);
				tx.forEach(p => model.add(p));

				const threshold = +elm.select(".buttons [name=threshold]").property("value");
				const outliers = tx.map(p => model.predict(p) > threshold);
				cb(outliers)
			}, 1);
		}
	}

	elm.select(".buttons")
		.append("select")
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
	elm.select(".buttons")
		.append("span")
		.text(" k = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("value", checkCount)
		.attr("min", 1)
		.attr("max", 100)
		.property("required", true)
		.on("change", function() {
			checkCount = +d3.select(this).property("value");
		});
	if (mode === 'RG') {
		elm.select(".buttons")
			.append("select")
			.on("change", function() {
				weightType = d3.select(this).property("value") == "inverse distance weight";
			})
			.selectAll("option")
			.data(["no weight", "inverse distance weight"])
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d);
	} else if (mode === 'AD') {
		elm.select(".buttons")
			.append("span")
			.text(" threshold = ");
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "threshold")
			.attr("value", 50)
			.attr("min", 1)
			.attr("max", 200)
			.property("required", true)
			.attr("step", 0.1)
			.on("change", function() {
				calcKnn();
			});
	}
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcKnn);
}


var knearestneighbor_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispKNN(root, mode, setting);

	setting.terminate = () => {
		d3.selectAll("svg .tile").remove();
	};
}

export default knearestneighbor_init

