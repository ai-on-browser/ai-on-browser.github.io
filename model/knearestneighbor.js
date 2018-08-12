class KNN {
	constructor(k = 5) {
		this._p = [];
		this._c = [];
		this._k = k;
	}

	get k() {
		return this._k;
	}
	set k(value) {
		this._k = value;
	}

	add(point, category) {
		this._p.push(point);
		this._c.push(category);
	}

	predict(data) {
		let ps = [];
		this._p.forEach((p, i) => {
			let d = data.distance(p);
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop();
				ps.push({
					"point": p,
					"d": d,
					"category": this._c[i]
				});
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d <= ps[k].d) {
						break;
					}
					[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]];
				}
			}
		});
		let clss = {};
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
		for (let k in clss) {
			if (max_count < clss[k].count || (max_count == clss[k].count && clss[k].min_d < min_dist)) {
				max_count = clss[k].count;
				min_dist = clss[k].min_d;
				target_cat = k;
			}
		}
		return target_cat;
	}
}

var dispKNN = function(elm) {
	const svg = d3.select("svg");
	const tileLayer = svg.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	const tileSize = 4;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	let checkCount = 5;

	const calcKnn = function() {
		tileLayer.selectAll("*").remove();
		if (points.length == 0) {
			return;
		}
		let model = new KNN(checkCount);
		points.forEach(p => model.add(p.vector, p.category));
		let categories = [];
		for (let i = 0; i < height / tileSize; i++) {
			categories[i] = [];
			for (let j = 0; j < width / tileSize; j++) {
				const point = new DataVector([(j + 0.5) * tileSize, (i + 0.5) * tileSize]);
				categories[i][j] = model.predict(point);
			}
		}

		new DataHulls(tileLayer, categories, tileSize);
	}

	elm.select(".buttons")
		.append("select")
		.on("change", function() {
		})
		.selectAll("option")
		.data([
			{
				"value": "euc",
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d["value"])
		.text(d => d["value"]);
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcKnn);
}


var knearestneighbor_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispKNN(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}
