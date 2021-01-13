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

var dispSVM = function(elm, mode, platform) {
	const step = 4;
	let model = new SVMWorker();
	let learn_epoch = 0;
	let isRunning = false;
	let lock = false;

	const calcSVM = function(cb) {
		if (platform.datas.length == 0) {
			return;
		}
		if (lock) return;
		lock = true;
		let iteration = +elm.select(".buttons [name=iteration]").property("value");
		platform.plot((tx, ty, px, pred_cb) => {
			model.fit(iteration, e => {
				if (mode === 'AD') {
					px = [].concat(tx, px);
				}
				model.predict(px, e => {
					let data = e.data;
					if (mode === 'AD') {
						data = data.map(d => d < 0);
						pred_cb(data.slice(0, tx.length), data.slice(tx.length));
					} else {
						pred_cb(data);
					}
					elm.select(".buttons [name=epoch]").text(learn_epoch += iteration);

					lock = false;
					cb && cb();
				});
			});
		}, step);
	};

	if (mode === 'AD') {
		elm.select(".buttons")
			.append("input")
			.attr("name", "method")
			.attr("type", "hidden")
			.attr("value", "oneclass")
	} else {
		elm.select(".buttons")
			.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "oneall"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	elm.select(".buttons")
		.append("select")
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "gamma")
		.attr("value", mode === 'AD' ? 0.1 : 1)
		.attr("min", 0.01)
		.attr("max", 10.0)
		.attr("step", 0.01);
	if (mode === 'AD') {
		elm.select(".buttons")
			.append("span")
			.text("nu")
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "nu")
			.attr("value", 0.5)
			.attr("min", 0)
			.attr("max", 1)
			.attr("step", 0.01);
	}
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			let x = platform.datas.x.map(p => p.map(v => v / 1000));
			let y = platform.datas.y;
			let kernel = elm.select(".buttons [name=kernel]").property("value");
			if (kernel == "gaussian") {
				kernel = [kernel, +elm.select("input[name=gamma]").property("value")];
			}
			model.initialize(kernel, x, y, elm.select("[name=method]").property("value"));
			elm.select(".buttons [name=epoch]").text(learn_epoch = 0);
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
	const fitButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", function() {
			fitButton.property("disabled", true);
			runButton.property("disabled", true);
			calcSVM(() => {
				fitButton.property("disabled", false);
				runButton.property("disabled", false);
			})
		});
	const runButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			runButton.attr("value", (isRunning) ? "Stop" : "Run");
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						calcSVM(() => setTimeout(stepLoop, 0));
					}
					fitButton.property("disabled", isRunning);
					runButton.property("disabled", false);
				})();
			} else {
				runButton.property("disabled", true);
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

var svm_init = function(platform) {
	const root = platform.setting.ml.configElement
	const mode = platform.task
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	let termCallback = dispSVM(root, mode, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default svm_init
