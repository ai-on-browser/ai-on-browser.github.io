class Lasso2dWorker extends BaseWorker {
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

var dispLasso2d = function(elm) {
	const svg = d3.select("svg");
	const tileLayer = svg.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	const step = 4;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	let model = new Lasso2dWorker();
	let isRunning = false;
	let epoch = 0;

	const fitModel = (cb) => {
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
			model.initialize(2, 1, +elm.select(".buttons [name=lambda]").property("value"), elm.select(".buttons [name=method]").property("value"));
			tileLayer.selectAll("*").remove();
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


var lasso_2d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispLasso2d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}
