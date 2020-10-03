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

var dispLassoReg = function(elm, model, platform) {
	const step = 4;

	return (cb) => {
		platform.plot((tx, ty, px, pred_cb) => {
				model.fit(tx, ty, 1, () => {
					model.predict(px, (e) => {
						pred_cb(e.data);

						cb && cb();
					});
				});
			}, step
		);
	};
}

var dispLasso = function(elm, platform) {
	let model = new LassoWorker();
	const fitModel = dispLassoReg(elm, model, platform);
	let isRunning = false;
	let epoch = 0;

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
			const dim = platform.datas.dimension;
			model.initialize(dim, 1, +elm.select(".buttons [name=lambda]").property("value"), elm.select(".buttons [name=method]").property("value"));
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
							elm.select(".buttons [name=epoch]").text(epoch += 1);
							setTimeout(stepLoop, 0)
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

var lasso_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispLasso(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default lasso_init

