class AutoEncoderWorker extends BaseWorker {
	constructor() {
		super('model/mlp_worker.js');
	}

	initialize(features, hidden_size, activation) {
		this._postMessage({
			"mode": "init",
			"type": "regression",
			"features": features,
			"classes": features,
			"hidden_size": hidden_size,
			"activation": activation,
			"sparse": [false, true]
		});
	}

	fit(train_x, train_y, iteration, rate, batch, rho, cb) {
		this._postMessage({
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration,
			"batch": batch,
			"rate": rate,
			"rho": rho
		}, cb);
	}

	predict(x, cb) {
		this._postMessage({
			"mode": "predict",
			"x": x
		}, cb);
	}

	forward(x, cb) {
		this._postMessage({
			"mode": "forward",
			"x": x
		}, cb);
	}
}

var dispAEClt = function(elm, model, tileLayer) {
	const svg = d3.select("svg");
	const step = 8;

	let lock = false;
	return (cb) => {
		if (lock) return;
		lock = true;

		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;

		const x = points.map(p => [p.at[0] / 1000, p.at[1] / 1000]);
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const rho = +elm.select(".buttons [name=rho]").property("value");

		model.fit(x, x, iteration, rate, batch, rho, (e) => {
			let epoch = e.data;
			let tiles = [];
			for (let i = 0; i < width; i += step) {
				for (let j = 0; j < height; j += step) {
					tiles.push([i / 1000, j / 1000]);
				}
			}

			model.forward(tiles, (e) => {
				let tfw = e.data;
				let tpred = tfw[2];
				let d = tpred.length / tiles.length;
				let c = 0;
				let categories = [];
				for (let i = 0; i < width / step; i++) {
					for (let j = 0; j < height / step; j++) {
						if (!categories[j]) categories[j] = [];

						let max_v = 0;
						let max_c = 0;
						for (let k = 0; k < d; k++) {
							let cur_v = Math.abs(tpred[c++]);
							if (cur_v > max_v) {
								max_v = cur_v;
								max_c = k;
							}
						}
						categories[j][i] = max_c + 1;
					}
				}

				tileLayer.selectAll("*").remove();
				new DataHulls(tileLayer, categories, step);

				model.forward(x, (e) => {
					let fw = e.data;
					let pred = fw[2];
					let d = pred.length / points.length;

					for (let i = 0, n = 0; i < pred.length; n++) {
						let max_v = 0;
						let max_c = 0;
						for (let k = 0; k < d; k++, i++) {
							if (max_v < Math.abs(pred[i])) {
								max_v = Math.abs(pred[i]);
								max_c = k;
							}
						}
						points[n].category = max_c + 1;
					}
					elm.select(".buttons [name=epoch]").text(epoch);
					lock = false;
					cb && cb();
				});
			});
		});
	};
}

var dispAEad = function(elm, model, tileLayer) {
	const svg = d3.select("svg");

	const outliers = [];

	let lock = false;
	return (cb) => {
		if (lock) return;
		lock = true;

		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;

		const x = points.map(p => [p.at[0] / 1000, p.at[1] / 1000]);
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const rho = +elm.select(".buttons [name=rho]").property("value");
		const threshold = +elm.select(".buttons [name=threshold]").property("value");

		model.fit(x, x, iteration, rate, batch, rho, (e) => {
			let epoch = e.data;

			model.predict(x, (e) => {
				let pred = e.data;
				let d = pred.length / points.length;
				outliers.forEach(o => o.remove());
				outliers.length = 0;

				for (let i = 0, n = 0; i < pred.length; n++) {
					let v = 0;
					for (let k = 0; k < d; k++, i++) {
						v += (pred[i] - x[n][k]) ** 2;
					}
					if (v > threshold) {
						outliers.push(new DataCircle(tileLayer, points[n]));
					}
				}
				outliers.forEach(o => {
					o.color = d3.rgb(255, 0, 0);
				});
				elm.select(".buttons [name=epoch]").text(epoch);
				lock = false;
				cb && cb();
			});
		});
	};
}

var dispAEdr = function(elm, model, mapping) {
	const svg = d3.select("svg");

	let map_points = [];

	let lock = false;
	return (cb) => {
		if (lock) return;
		lock = true;

		const width = svg.node().getBoundingClientRect().width;
		const height = svg.node().getBoundingClientRect().height;

		const x = points.map(p => [p.at[0] / 1000, p.at[1] / 1000]);
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const rho = +elm.select(".buttons [name=rho]").property("value");

		model.fit(x, x, iteration, rate, batch, rho, (e) => {
			let epoch = e.data;

			model.forward(x, (e) => {
				let fw = e.data;
				let pred = fw[2];

				map_points.forEach(p => p.remove());
				let y_max = Math.max(...pred);
				let y_min = Math.min(...pred);

				map_points = pred.map((v, i) => {
					let pv = [(v - y_min) / (y_max - y_min) * (width - 10) + 5, height / 2];
					let p = new DataPoint(mapping, pv, points[i].category);
					p.radius = 2;
					let dl = new DataLine(mapping, points[i], p);
					dl.item.attr("opacity", 0.5);
					dl.setRemoveListener(() => p.remove());
					return p;
				});
				elm.select(".buttons [name=epoch]").text(epoch);
				lock = false;
				cb && cb();
			});
		});
	};
}

var dispAE = function(elm, mode) {
	const svg = d3.select("svg");
	let model = new AutoEncoderWorker();
	const tileLayer = (mode == "AD") ? svg.append("g").classed("tile", true) : svg.insert("g", ":first-child").classed("tile", true).attr("opacity", 0.5);
	const fitModel = (mode == "AD") ? dispAEad(elm, model, tileLayer) : (mode == "CT") ? dispAEClt(elm, model, tileLayer) : dispAEdr(elm, model, tileLayer);

	const layers = [
		{
			"size": (mode == "DR") ? 1 : 10,
			"a": "sigmoid",
			"poly_pow": 2
		}
	];
	if (mode != "DR") {
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
				layers[0].size = +d3.select(this).property("value");
			});
	}
	elm.select(".buttons")
		.append("span")
		.text(" Activation ");
	elm.select(".buttons")
		.append("select")
		.attr("name", "activation")
		.on("change", function() {
			let a = d3.select(this).property("value");
			elm.select("input[name=poly_pow]").style("display", (a == "polynomial") ? "inline" : "none");
			layers[0].a = a;
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
			layers[0].poly_pow = +d3.select(this).property("value");
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
			let activation = layers.map(l => {
				if (l.a == "polynomial") {
					return [l.a, l.poly_pow];
				}
				return [l.a];
			});
			const hidden_number = layers.map(l => l.size);

			model.initialize(2, hidden_number, activation);
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
	elm.select(".buttons")
		.append("span")
		.text(" Sparse rho ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "rho")
		.attr("value", 0.02)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.01);
	if (mode == "AD") {
		elm.select(".buttons")
			.append("span")
			.text(" threshold = ");
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "threshold")
			.attr("value", 0.02)
			.attr("min", 0)
			.attr("max", 10)
			.attr("step", 0.01);
	}
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

var autoencoder_init = function(root, terminateSetter, mode) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispAE(root, mode);

	terminateSetter(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}

