class SVMWorker extends BaseWorker {
	constructor() {
		super('model/svm_worker.js');
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

var dispSVM = function(elm) {
	const svg = d3.select("svg");
	const tileLayer = svg.insert("g", ":first-child").attr("class", "tile").attr("opacity", 0.5);
	const tileSize = 4;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;
	let model = new SVMWorker();
	let learn_epoch = 0;
	let isRunning = false;
	let lock = false;

	const calcSVM = function(cb) {
		if (points.length == 0) {
			return;
		}
		if (lock) return;
		lock = true;
		let categories = [];
		let iteration = +elm.select(".buttons [name=iteration]").property("value");
		model.fit(iteration, e => {
			let ps = [];
			for (let i = 0; i < height; i += tileSize) {
				for (let j = 0; j < width; j += tileSize) {
					ps.push([(j + 0.5 * tileSize) / width, (i + 0.5 * tileSize) / height]);
				}
			}
			model.predict(ps, e => {
				let data = e.data;
				let p = 0;
				for (let i = 0; i < height / tileSize; i++) {
					categories[i] = [];
					for (let j = 0; j < width / tileSize; j++) {
						categories[i][j] = data[p++];
					}
				}

				tileLayer.selectAll("*").remove();
				new DataHulls(tileLayer, categories, tileSize);
				elm.select(".buttons [name=epoch]").text(learn_epoch += iteration);

				lock = false;
				cb && cb();
			});
		});
	}

	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["oneone", "oneall"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
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
		.attr("value", 2)
		.attr("min", 0.1)
		.attr("max", 10.0)
		.attr("step", 0.1);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			let x = [];
			let y = [];
			points.forEach(p => {
				x.push([p.at[0] / width, p.at[1] / height]);
				y.push(p.category);
			});
			let kernel = elm.select(".buttons [name=kernel]").property("value");
			if (kernel == "gaussian") {
				kernel = [kernel, +elm.select("input[name=gamma]").property("value")];
			}
			model.initialize(kernel, x, y, elm.select("select[name=method]").property("value"));
			elm.select(".buttons [name=epoch]").text(learn_epoch = 0);
			tileLayer.selectAll("*").remove();
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
		.on("click", calcSVM);
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
						calcSVM(() => setTimeout(stepLoop, 0));
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

var svm_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	let termCallback = dispSVM(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}
