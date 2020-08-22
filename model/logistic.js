class LogisticRegressionWorker extends BaseWorker {
	constructor(classes) {
		super('model/logistic_worker.js');
	}

	initialize(features, classes) {
		this._postMessage({
			"mode": "init",
			"features": features,
			"classes": classes
		});
	}

	fit(train_x, train_y, iteration, rate, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration,
			"rate": rate
		}, cb);
	}

	predict(x, cb) {
		this._postMessage({
			"mode": "predict",
			"x": x
		}, cb);
	}
}

var dispLogistic = function(elm, platform) {
	const step = 4;

	let model_classes = 0;
	let learn_epoch = 0;
	let model = new LogisticRegressionWorker();
	let lock = false;

	const fitModel = (cb) => {
		if (model_classes == 0) {
			return;
		}
		if (lock) return;
		lock = true;

		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		platform.plot((tx, ty, px, pred_cb) => {
				model.fit(tx, ty, iteration, +elm.select(".buttons [name=rate]").property("value"), () => {
					model.predict(px, (e) => {
						pred_cb(e.data);
						elm.select(".buttons [name=epoch]").text(learn_epoch += iteration);

						lock = false;
						cb && cb();
					});
				});
			}, step
		);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			elm.select(".buttons [name=epoch]").text(learn_epoch = 0);
			model_classes = Math.max.apply(null, platform.datas.y) + 1;
			model.initialize(platform.datas.dimension, model_classes);
			platform.init()
		});
	elm.select(".buttons")
		.append("span")
		.text(" Iteration ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("span")
		.text(" Learning rate ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "rate")
		.selectAll("option")
		.data([0.1, 1, 10])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
	let isRunning = false;
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
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");

	return () => {
		isRunning = false;
		model.terminate();
	};
}


var logistic_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispLogistic(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default logistic_init
