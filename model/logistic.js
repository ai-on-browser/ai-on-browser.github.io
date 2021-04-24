class LogisticRegressionWorker extends BaseWorker {
	constructor(classes) {
		super('model/worker/logistic_worker.js');
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

	const fitModel = (cb) => {
		if (model_classes == 0) {
			return;
		}

		const iteration = +elm.select("[name=iteration]").property("value");
		platform.fit((tx, ty) => {
			model.fit(tx, ty, iteration, +elm.select("[name=rate]").property("value"), () => {
				platform.predict((px, pred_cb) => {
					model.predict(px, (e) => {
						pred_cb(e.data);
						learn_epoch += iteration;

						cb && cb();
					});
				}, step);
			})
		});
	};

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		learn_epoch = 0;
		model_classes = Math.max.apply(null, platform.datas.y) + 1;
		model.initialize(platform.datas.dimension, model_classes);
		platform.init()
	});
	elm.append("span")
		.text(" Iteration ");
	elm.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" Learning rate ");
	elm.append("select")
		.attr("name", "rate")
		.selectAll("option")
		.data([0.1, 1, 10])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	slbConf.step(fitModel).epoch(() => learn_epoch)

	return () => {
		slbConf.stop()
		model.terminate();
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispLogistic(platform.setting.ml.configElement, platform)
}
