class AutoEncoderWorker extends BaseWorker {
	constructor() {
		super('model/mlp_worker.js');
	}

	initialize(features, hidden_size, activation) {
		this._postMessage({
			"mode": "init",
			"type": "regression",
			"size": [features, ...hidden_size, features || 1],
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

class Autoencoder {
	constructor() {
		this._model = new AutoEncoderWorker()
	}

	get epoch() {
		return this._epoch
	}

	terminate() {
		this._model.terminate()
	}

	initialize(features, hidden_size, activation) {
		this._model.initialize(features, hidden_size, activation)
	}

	fit(train_x, train_y, iteration, rate, batch, rho, cb) {
		this._model.fit(train_x, train_y, iteration, rate, batch, rho, e => {
			this._epoch = e.data
			cb && cb(e)
		})
	}

	predict(x, cb) {
		this._model.predict(x, cb)
	}

	reduce(x, cb) {
		this._model.forward(x, e => {
			cb && cb(e.data[2])
		})
	}
}

var dispAEClt = function(elm, model, platform) {
	const step = 8;

	let lock = false;
	return (cb) => {
		if (lock) return;
		lock = true;

		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const rho = +elm.select(".buttons [name=rho]").property("value");
		platform.plot(
			(tx, ty, px, pred_cb) => {
				model.fit(tx, tx, iteration, rate, batch, rho, (e) => {
					model.reduce(tx, (e) => {
						let pred = e;
						let p_mat = Matrix.fromArray(pred);

						const t_mat = p_mat.argmax(1).value.map(v => v + 1)
						model.reduce(px, (e) => {
							let tpred = e;
							let p_mat = Matrix.fromArray(tpred);
							let categories = p_mat.argmax(1);
							categories.add(1);
							pred_cb(t_mat, categories.value);

							elm.select(".buttons [name=epoch]").text(model.epoch);
							lock = false;
							cb && cb();
						});
					});
				});
			}, step
		);
	};
}

var dispAEad = function(elm, model, platform) {
	let lock = false;
	return (cb) => {
		if (lock) return;
		lock = true;

		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const rho = +elm.select(".buttons [name=rho]").property("value");
		const threshold = +elm.select(".buttons [name=threshold]").property("value");

		platform.plot((tx, ty, px, pred_cb) => {
			model.fit(tx, tx, iteration, rate, batch, rho, (e) => {
				let pd = [].concat(tx, px);
				model.predict(pd, (e) => {
					let pred = e.data.slice(0, tx.length);
					let pred_tile = e.data.slice(tx.length);
					let d = tx[0].length;

					const outliers = []
					for (let i = 0; i < pred.length; i++) {
						let v = 0;
						for (let k = 0; k < d; k++) {
							v += (pred[i][k] - tx[i][k]) ** 2;
						}
						outliers.push(v > threshold);
					}
					const outlier_tiles = []
					for (let i = 0; i < pred_tile.length; i++) {
						let v = 0;
						for (let k = 0; k < d; k++) {
							v += (pred_tile[i][k] - px[i][k]) ** 2;
						}
						outlier_tiles.push(v > threshold);
					}
					pred_cb(outliers, outlier_tiles)

					elm.select(".buttons [name=epoch]").text(model.epoch);
					lock = false;
					cb && cb();
				});
			});
		}, 4)
	};
}

var dispAEdr = function(elm, model, platform) {
	let lock = false;
	return (cb) => {
		if (lock) return;
		lock = true;

		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const rho = +elm.select(".buttons [name=rho]").property("value");

		platform.plot(
			(tx, ty, px, pred_cb) => {
				model.fit(tx, tx, iteration, rate, batch, rho, (e) => {
					model.reduce(px, (e) => {
						pred_cb(Matrix.fromArray(e).value);
						elm.select(".buttons [name=epoch]").text(model.epoch);
						lock = false;
						cb && cb();
					});
				});
			}
		);
	};
}

var dispAE = function(elm, setting, platform) {
	const mode = platform.task
	let model = new Autoencoder();
	const fitModel = (mode == "AD") ? dispAEad(elm, model, platform) : (mode == "CT") ? dispAEClt(elm, model, platform) : dispAEdr(elm, model, platform);

	const layers = [
		{
			"size": (mode == "DR") ? 2 : 10,
			"a": "sigmoid",
			"poly_pow": 2
		}
	];
	if (mode !== "DR") {
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
			platform.init()
			elm.select(".buttons [name=epoch]").text(0);
			if (platform.datas.length == 0) {
				return;
			}
			if (mode === 'DR') {
				layers[0].size = setting.dimension;
			}
			let activation = layers.map(l => {
				if (l.a == "polynomial") {
					return [l.a, l.poly_pow];
				}
				return [l.a];
			});
			const hidden_number = layers.map(l => l.size);

			model.initialize(platform.datas.dimension, hidden_number, activation);
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

var autoencoder_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispAE(root, setting, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default autoencoder_init

