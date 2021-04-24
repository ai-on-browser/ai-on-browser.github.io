class SVMWorker extends BaseWorker {
	constructor() {
		super('model/worker/svm_worker.js');
	}

	initialize(kernel, train_x, train_y, method = "oneone") {
		this._postMessage({
			"mode": "init",
			"method": method,
			"kernel": kernel,
			"x": train_x,
			"y": train_y
		});
	}

	fit(iteration, cb) {
		this._postMessage({
			"mode": "fit",
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

var dispSVM = function(elm, platform) {
	const mode = platform.task;
	const step = 4;
	let model = new SVMWorker();
	let learn_epoch = 0;

	const calcSVM = function(cb) {
		if (platform.datas.length == 0) {
			return;
		}
		let iteration = +elm.select("[name=iteration]").property("value");
		platform.fit((tx, ty, fit_cb) => {
			model.fit(iteration, e => {
				platform.predict((px, pred_cb) => {
					if (mode === 'AD') {
						px = [].concat(tx, px);
					}
					model.predict(px, e => {
						let data = e.data;
						if (mode === 'AD') {
							data = data.map(d => d < 0);
							fit_cb(data.slice(0, tx.length));
							pred_cb(data.slice(tx.length));
						} else {
							pred_cb(data);
						}
						learn_epoch += iteration
						cb && cb();
					});
				}, step)
			});
		});
	};

	if (mode === 'AD') {
		elm.append("input")
			.attr("name", "method")
			.attr("type", "hidden")
			.attr("value", "oneclass")
	} else {
		elm.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "oneall"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	elm.append("select")
		.attr("name", "kernel")
		.on("change", function() {
			let k = d3.select(this).property("value");
			if (k == "gaussian") {
				elm.select("input[name=gamma]").style("display", "inline");
			} else {
				elm.select("input[name=gamma]").style("display", "none");
			}
		})
		.selectAll("option")
		.data(["gaussian", "linear"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "number")
		.attr("name", "gamma")
		.attr("value", mode === 'AD' ? 0.1 : 1)
		.attr("min", 0.01)
		.attr("max", 10.0)
		.attr("step", 0.01);
	if (mode === 'AD') {
		elm.append("span")
			.text("nu")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "nu")
			.attr("value", 0.5)
			.attr("min", 0)
			.attr("max", 1)
			.attr("step", 0.01);
	}
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.datas.scale = 1 / 1000
		let x = platform.datas.x;
		let y = platform.datas.y;
		let kernel = elm.select("[name=kernel]").property("value");
		if (kernel == "gaussian") {
			kernel = [kernel, +elm.select("input[name=gamma]").property("value")];
		}
		model.initialize(kernel, x, y, elm.select("[name=method]").property("value"));
		learn_epoch = 0
		platform.init()
	})
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
	slbConf.step(calcSVM).epoch(() => learn_epoch)

	return () => {
		slbConf.stop()
		model.terminate();
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.terminate = dispSVM(platform.setting.ml.configElement, platform);
}
