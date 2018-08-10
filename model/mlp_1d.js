class MLP1dWorker extends BaseWorker {
	constructor(classes) {
		super('model/mlp_worker.js');
	}

	initialize(hidden_size, activation) {
		this._postMessage({
			"mode": "init",
			"type": "regression",
			"features": 1,
			"hidden_size": hidden_size,
			"activation": activation
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

var dispMLP_1d = function(elm) {
	const svg = d3.select("svg");
	const reg_path = svg.insert("g", ":first-child").classed("tile", true).append("path").attr("stroke", "black").attr("fill-opacity", 0);
	const step = 2;
	const width = svg.node().getBoundingClientRect().width;
	const height = svg.node().getBoundingClientRect().height;

	let learn_epoch = 0;
	let model = new MLP1dWorker();
	let lock = false;
	const line = d3.line().x(d => d[0]).y(d => d[1]);

	const fitModel = (cb) => {
		if (lock) return;
		lock = true;
		const ps = points;
		const tx = ps.map(p => [p.at[0] / width]);
		const ty = ps.map(p => [p.at[1] / height]);
		const iteration = +elm.select(".buttons [name=iteration]").property("value");

		model.fit(tx, ty, iteration, +elm.select(".buttons [name=rate]").property("value"), (e) => {
			let tiles = [];
			for (let i = 0; i < width; i += step) {
				tiles.push([i / width]);
			}

			model.predict(tiles, (e) => {
				let pred = e.data;
				let p = [];
				for (let i = 0; i < width / step; i++) {
					p.push([i * step, pred[i] * height]);
				}

				reg_path.attr("d", line(p));
				elm.select(".buttons [name=epoch]").text(learn_epoch += iteration);

				lock = false;
				cb && cb();
			});
		});
	};

	elm.select(".buttons")
		.append("span")
		.text(" Hidden = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "hidden_number")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.property("required", true);
	elm.select(".buttons")
		.append("select")
		.attr("name", "activation")
		.on("change", function() {
			let a = d3.select(this).property("value");
			if (a == "polynomial") {
				elm.select("input[name=poly_pow]").style("display", "inline");
			} else {
				elm.select("input[name=poly_pow]").style("display", "none");
			}
		})
		.selectAll("option")
		.data(["sigmoid", "tanh", "relu", "leaky_relu", "softsign", "softplus", "linear", "polynomial", "abs"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "poly_pow")
		.attr("value", 2)
		.attr("min", 1)
		.attr("max", 10)
		.attr("step", 1)
		.style("display", "none");
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			elm.select(".buttons [name=epoch]").text(learn_epoch = 0);
			let activation = elm.select(".buttons [name=activation]").property("value");
			if (activation == "polynomial") {
				activation = [activation, +elm.select("input[name=poly_pow]").property("value")];
			}
			const hidden_number = +elm.select(".buttons [name=hidden_number]").property("value");

			model.initialize(hidden_number, activation);
			reg_path.attr("d", null);
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
		.data([0.001, 0.01, 0.1, 1, 10])
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


var mlp_1d_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispMLP_1d(root);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}
