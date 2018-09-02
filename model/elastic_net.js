class ElasticNetWorker extends BaseWorker {
	constructor(classes) {
		super('model/elastic_net_worker.js');
	}

	initialize(in_dim, out_dim, lambda = 0.1, alpha = 0.5) {
		this._postMessage({
			"mode": "init",
			"in_dim": in_dim,
			"out_dim": out_dim,
			"lambda": lambda,
			"alpha": alpha
		});
	}

	fit(train_x, train_y, iteration, alpha, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration,
			"alpha": alpha
		}, cb);
	}

	predict(x, cb) {
		this._postMessage({
			"mode": "predict",
			"x": x
		}, cb);
	}
}

var dispElasticNetReg = function(elm, model, mode) {
	const svg = d3.select("svg");
	const step = 4;

	let epoch = 0;

	return (cb) => {
		fitting(mode, svg, points, step,
			(tx, ty, fit_cb) => {
				model.fit(tx, ty, 1, +elm.select(".buttons [name=alpha]").property("value"), () => {
					fit_cb();
				});
			},
			(x, pred_cb) => {
				model.predict(x, (e) => {
					pred_cb(e.data);
					elm.select(".buttons [name=epoch]").text(epoch += 1);

					cb && cb();
				});
			}
		);
	};
}

var dispElasticNet = function(elm, mode) {
	const svg = d3.select("svg");
	let model = new ElasticNetWorker();
	const fitModel = dispElasticNetReg(elm, model, mode);
	let isRunning = false;

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
		.append("span")
		.text("alpha = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("value", 0.5)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.on("change", function() {
			let val = +d3.select(this).property("value");
			elm.select("[name=sp]").text(
				(val == 0) ? " ridge " :
				(val == 1) ? " lasso " :
				"");
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "sp");
	const initButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			model.initialize(+mode[1], 1, +elm.select(".buttons [name=lambda]").property("value"), +elm.select(".buttons [name=alpha]").property("value"));
			svg.selectAll(".tile *").remove();
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

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model.terminate();
	}
}

var elastic_net_init = function(root, terminateSetter, mode) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispElasticNet(root, mode);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}

