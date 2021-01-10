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

	importance(cb) {
		this._postMessage({
			"mode": "importance"
		}, cb)
	}
}

var dispElasticNetReg = function(elm, model, platform) {
	const step = 4;
	const task = platform.task

	return (cb) => {
		platform.plot((tx, ty, px, pred_cb) => {
				model.fit(tx, ty, 1, +elm.select(".buttons [name=alpha]").property("value"), () => {
					if (task === 'FS') {
						model.importance(e => {
							const imp = Matrix.fromArray(e.data)
							const impi = imp.value.map((i, k) => [i, k])
							impi.sort((a, b) => b[0] - a[0])
							const tdim = platform.setting.dimension
							const idx = impi.map(i => i[1]).slice(0, tdim)
							const x = Matrix.fromArray(tx)
							pred_cb(x.col(idx).toArray())
							cb && cb()
						})
					} else {
						model.predict(px, (e) => {
							pred_cb(e.data);

							cb && cb();
						});
					}
				});
			}, step
		);
	};
}

var dispElasticNet = function(elm, platform) {
	let model = new ElasticNetWorker();
	const fitModel = dispElasticNetReg(elm, model, platform);
	let isRunning = false;
	let epoch = 0;

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
			const dim = platform.datas.dimension;
			model.initialize(dim, 1, +elm.select(".buttons [name=lambda]").property("value"), +elm.select(".buttons [name=alpha]").property("value"));
			platform.init()
			elm.select(".buttons [name=epoch]").text(epoch = 0);
		});
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			fitModel()
			elm.select(".buttons [name=epoch]").text(epoch += 1);
		});
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
						fitModel(() => {
							setTimeout(stepLoop, 0)
							elm.select(".buttons [name=epoch]").text(epoch += 1);
						});
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

var elastic_net_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispElasticNet(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default elastic_net_init

