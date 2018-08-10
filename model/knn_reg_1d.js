class KNNRegression_1d {
	constructor(k = 5, weight = false) {
		this._p = [];
		this._c = [];
		this._k = k;
		this._weight = weight;
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
			let d = Math.abs(data - p);
			if (ps.length < this._k || d < ps[this._k - 1].d) {
				if (ps.length >= this._k) ps.pop();
				ps.push({
					"d": d,
					"category": this._c[i]
				});
				for (let k = ps.length - 1; k > 0; k--) {
					if (ps[k].d < ps[k - 1].d) {
						[ps[k], ps[k - 1]] = [ps[k - 1], ps[k]];
					}
				}
			}
		});
		if (this._weight) {
			let e = 1.0e-5;
			let s = ps.reduce((acc, v) => acc + 1 / (v.d + e), 0);
			return ps.reduce((acc, v) => acc + v.category / ((v.d + e) * s), 0);
		} else {
			return ps.reduce((acc, v) => acc + v.category, 0) / ps.length;
		}
	}
}

var dispKNNRegression1d = function(elm) {
	const svg = d3.select("svg");
	const reg_path = svg.insert("g", ":first-child").classed("tile", true).append("path").attr("stroke", "black").attr("fill-opacity", 0);
	const step = 1;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	const line = d3.line().x(d => d[0]).y(d => d[1]);
	let checkCount = 5;
	let weightType = false;

	const calcKnn = function() {
		reg_path.attr("d", null);
		if (points.length == 0) {
			return;
		}
		let model = new KNNRegression_1d(checkCount, weightType);
		points.forEach(p => {
			model.add(p.at[0], p.at[1]);
		});

		let ps = [];
		for (let i = 0; i < width; i += step) {
			ps.push(i);
		}
		ps.push(width);
		let p = ps.map(p => model.predict(p)).map((v, i) => [ps[i], v]);

		reg_path.attr("d", line(p));
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcKnn);
}


var knn_reg_1d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispKNNRegression1d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
	});
}

var dispLasso1d = function(elm) {
	const svg = d3.select("svg");
	const reg_path = svg.insert("g", ":first-child").classed("tile", true).append("path").attr("stroke", "black").attr("fill-opacity", 0);
	const step = 100;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const line = d3.line().x(d => d[0]).y(d => d[1]);
	let model = new Lasso1dWorker();
	let isRunning = false;
	let epoch = 0;

	const fitModel = (cb) => {
		let x = points.map(p => [p.at[0] / width]);
		let t = points.map(p => [p.at[1] / height]);
		model.fit(x, t, 1, () => {
			let ps = [];
			for (let i = 0; i < width; i += step) {
				ps.push([i / width]);
			}
			ps.push([1]);
			model.predict(ps, (e) => {
				let y = e.data;

				let p = ps.map((v, i) => [v[0] * width, y[i] * height]);;

				reg_path.attr("d", line(p));
				elm.select(".buttons [name=epoch]").text(epoch += 1);

				cb && cb();
			});
		});
	};

	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["CD", "ISTA"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("span")
		.text("lambda = ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "lambda")
		.selectAll("option")
		.data([0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model.initialize(1, 1, +elm.select(".buttons [name=lambda]").property("value"), elm.select(".buttons [name=method]").property("value"));
			reg_path.attr("d", null);
			elm.select(".buttons [name=epoch]").text(epoch = 0);
		});
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			fitButton.property("disabled", isRunning);
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
				})();
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");

	return () => {
		isRunning = false;
		model.terminate();
	}
}


var lasso_1d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispLasso1d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}
