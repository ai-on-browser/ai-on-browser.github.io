class MLPWorker extends BaseWorker {
	constructor() {
		super('model/mlp_worker.js');
	}

	initialize(features, classes, hidden_size, activation) {
		this._classes = classes;
		this._postMessage({
			"mode": "init",
			"type": classes ? "classifier" : "regression",
			"features": features,
			"classes": classes,
			"hidden_size": hidden_size,
			"activation": activation
		});
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration,
			"batch": batch,
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

var dispMLP = function(elm, mode) {
	const svg = d3.select("svg");
	let model = new MLPWorker();

	let lock = false;

	const fitModel = (cb) => {
		if (lock) return;
		lock = true;
		let ps = (mode == "CF") ? points.filter(p => p.category < model._classes) : points;
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const dim = +elm.select(".buttons [name=dimension]").property("value")

		const fitMode = (mode === 'RG') ? (dim === 1 ? 'D1' : 'D2') : mode;
		fitting(fitMode, svg, ps, dim === 1 ? 2 : 4,
			(tx, ty, px, pred_cb) => {
				model.fit(tx, ty, iteration, rate, batch, (e) => {
					let epoch = e.data;
					model.predict(px, (e) => {
						pred_cb(e.data);
						elm.select(".buttons [name=epoch]").text(epoch);

						lock = false;
						cb && cb();
					});
				});
			}
		);
	};

	const layers = [
		{
			"size": 10,
			"a": "sigmoid",
			"poly_pow": 2
		}
	];
	if (mode === 'RG') {
		const dimDiv = elm.select(".buttons").append("div")
		dimDiv.append("span")
			.text(" Dimension ");
		dimDiv.append("input")
			.attr("type", "number")
			.attr("name", "dimension")
			.attr("max", 2)
			.attr("min", 1)
			.attr("value", 2)
	} else {
		elm.select(".buttons")
			.append("input")
			.attr("type", "hidden")
			.attr("name", "dimension")
			.attr("value", 2)
	}
	elm.select(".buttons")
		.append("span")
		.text(" Hidden Layers ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "hidden_size")
		.attr("value", 1)
		.attr("min", 1)
		.attr("max", 10)
		.property("required", true)
		.on("change", function() {
			let size = d3.select(this).property("value");
			if (layers.length >= size) {
				layers.length = size;
			} else {
				for (let i = layers.length; i < size; i++) {
					layers.push({
						"size": 10,
						"a": "sigmoid",
						"poly_pow": 2
					});
				}
			}
			layer_idx.selectAll("*").remove();
			layer_idx.selectAll().data(layers).enter().append("option").property("value", (d, i) => i).text((d, i) => i + 1);
			layer_idx.on("change")();
		});
	elm.select(".buttons")
		.append("span")
		.text(" : Layer #");
	const layer_idx = elm.select(".buttons")
		.append("select")
		.attr("name", "hiddn_layer")
		.on("change", function() {
			const idx = layer_idx.property("value");
			elm.select("input[name=node_number]").property("value", layers[idx].size);
			elm.select("select[name=activation]").property("value", layers[idx].a);
			elm.select("input[name=poly_pow]").property("value", layers[idx].poly_pow);
		});
	layer_idx.selectAll("option")
		.data(layers)
		.enter()
		.append("option")
		.property("value", (d, i) => i)
		.text((d, i) => i + 1);
	elm.select(".buttons")
		.append("span")
		.text(" Size ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "node_number")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.property("required", true)
		.on("change", function() {
			let idx = layer_idx.property("value");
			layers[idx].size = +d3.select(this).property("value");
		});
	elm.select(".buttons")
		.append("span")
		.text(" Activation ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "activation")
		.on("change", function() {
			let a = d3.select(this).property("value");
			elm.select("input[name=poly_pow]").style("display", (a == "polynomial") ? "inline" : "none");
			let idx = layer_idx.property("value");
			layers[idx].a = a;
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
		.style("display", "none")
		.on("change", function() {
			let idx = layer_idx.property("value");
			layers[idx].poly_pow = +d3.select(this).property("value");
		});
	const initButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			elm.select(".buttons [name=epoch]").text(learn_epoch = 0);
			if (points.length == 0) {
				return;
			}
			const dim = +elm.select(".buttons [name=dimension]").property("value")
			let activation = layers.map(l => {
				if (l.a == "polynomial") {
					return [l.a, l.poly_pow];
				}
				return [l.a];
			});
			const hidden_number = layers.map(l => l.size);

			let model_classes = (mode == "CF") ? Math.max.apply(null, points.map(p => p.category)) + 1 : 0;
			model.initialize(dim, model_classes, hidden_number, activation);
			svg.selectAll(".tile *").remove();
		});
	elm.select(".buttons")
		.append("span")
		.text(" Iteration ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000, 10000])
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
	elm.select(".buttons")
		.append("span")
		.text(" Batch size ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "batch")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.attr("step", 1);
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

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model.terminate();
	};
}

var mlp_init = function(root, terminateSetter, mode) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispMLP(root, mode);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}

