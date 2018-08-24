class LassoWorker extends BaseWorker {
	constructor(classes) {
		super('model/lasso_worker.js');
	}

	initialize(in_dim, out_dim, lambda = 0.1, method = "CD") {
		this._postMessage({
			"mode": "init",
			"in_dim": in_dim,
			"out_dim": out_dim,
			"lambda": lambda,
			"method": method
		});
	}

	fit(train_x, train_y, iteration, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration
		}, cb);
	}

	predict(x, cb) {
		this._postMessage({
			"mode": "predict",
			"x": x
		}, cb);
	}
}

var dispLasso1d = function(elm, model, reg_path) {
	const svg = d3.select("svg");
	const step = 4;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	const line = d3.line().x(d => d[0]).y(d => d[1]);
	let epoch = 0;

	return (cb) => {
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

				let p = ps.map((v, i) => [v[0] * width, y[i] * height]);

				reg_path.attr("d", line(p));
				elm.select(".buttons [name=epoch]").text(epoch += 1);

				cb && cb();
			});
		});
	};
}

var dispLasso2d = function(elm, model, tileLayer) {
	const svg = d3.select("svg");
	const step = 4;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	let epoch = 0;

	return (cb) => {
		let x = points.map(p => [p.at[0] / width, p.at[1] / height]);
		let t = points.map(p => [p.category]);
		model.fit(x, t, 1, () => {
			let ps = [];
			for (let i = 0; i < width; i += step) {
				for (let j = 0; j < height; j += step) {
					ps.push([i / width, j / height]);
				}
			}

			model.predict(ps, (e) => {
				let pred = e.data;

				let categories = [];
				let n = 0;
				for (let i = 0; i < width / step; i++) {
					for (let j = 0; j < height / step; j++) {
						if (!categories[j]) categories[j] = [];
						categories[j][i] = pred[n++];
					}
				}

				tileLayer.selectAll("*").remove();
				new DataHulls(tileLayer, categories, step, true);
				elm.select(".buttons [name=epoch]").text(epoch += 1);

				cb && cb();
			});
		});
	};
}

var dispLasso = function(elm, mode) {
	const svg = d3.select("svg");
	let model = new LassoWorker();
	const tileLayer = (mode == "D1") ? svg.insert("g", ":first-child").classed("tile", true).append("path").attr("stroke", "black").attr("fill-opacity", 0) : svg.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	const fitModel = (mode == "D1") ? dispLasso1d(elm, model, tileLayer) : dispLasso2d(elm, model, tileLayer);
	let isRunning = false;

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
		.data([0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	const initButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model.initialize(+mode[1], 1, +elm.select(".buttons [name=lambda]").property("value"), elm.select(".buttons [name=method]").property("value"));
			(mode == "D1") ? tileLayer.attr("d", null) : tileLayer.selectAll("*").remove();
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
		.attr("name", "epoch")
		.text(0);
	elm.select(".buttons")
		.append("span")
		.attr("name", "loss");

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model.terminate();
	}
}

var lasso_init = function(root, terminateSetter, mode) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispLasso(root, mode);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}

