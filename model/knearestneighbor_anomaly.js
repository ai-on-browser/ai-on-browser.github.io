class KNN_anomaly {
	constructor(k = 5) {
		this._p = [];
		this._k = k;
	}

	get k() {
		return this._k;
	}
	set k(value) {
		this._k = value;
	}

	add(point) {
		this._p.push(point);
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
				});
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k - 1].d <= ps[k].d) {
						break;
					}
					[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]];
				}
			}
		});
		return ps[ps.length - 1].d;
	}
}

var dispKNN_anomaly = function(elm) {
	const svg = d3.select("svg");
	const outlier = svg.append("g").classed("outlier", true);
	let checkCount = 5;
	let outlierPoints = [];

	const calcKnn = function() {
		FittingMode.AD.fit(svg, points, null, (tx, ty, _, cb) => {
			let model = new KNN_anomaly(checkCount + 1);
			points.forEach(p => model.add(p.vector));

			const threshold = +elm.select(".buttons [name=threshold]").property("value");
			const outliers = [];
			points.forEach(p => {
				outliers.push(model.predict(p.vector) > threshold);
			})
			cb(outliers)
		});
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcKnn);
}


var knearestneighbor_anomaly_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispKNN_anomaly(root);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
	});
}
