class MLPWorker extends BaseWorker {
	constructor() {
		super('model/worker/neuralnetwork_worker.js');
	}

	initialize(layers, cb) {
		this._postMessage({
			"mode": "init",
			"layers": layers,
			"loss": "mse"
		}, cb);
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({
			"id": id,
			"mode": "fit",
			"x": train_x,
			"y": train_y,
			"iteration": iteration,
			"batch_size": batch,
			"rate": rate
		}, cb);
	}

	predict(id, x, cb) {
		this._postMessage({
			"id": id,
			"mode": "predict",
			"x": x
		}, cb);
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: "close"
		})
	}
}

class MLP {
	constructor() {
		this._model = new MLPWorker()
	}

	get type() {
		return this._type
	}

	get output_size() {
		return this._output_size
	}

	get epoch() {
		return this._epoch
	}

	initialize(input_size, output_size, layers) {
		if (this._id) {
			this._model.remove(this._id)
		}
		this._type = output_size ? "classifier" : "regression"
		this._output_size = output_size
		this._layers = [{type: 'input'}]
		this._layers.push(...layers)
		this._layers.push({
			type: 'full',
			out_size: output_size || 1
		})
		if (output_size) {
			this._layers.push({
				type: 'sigmoid'
			})
		}

		this._model.initialize(this._layers, (e) => {
			this._id = e.data
		})
	}

	terminate() {
		this._model.remove(this._id)
		this._model.terminate()
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._model.fit(this._id, train_x, train_y, iteration, rate, batch, e => {
			this._epoch = e.data.epoch
			cb && cb(e)
		})
	}

	predict(x, cb) {
		this._model.predict(this._id, x, cb)
	}
}

var dispMLP = function(elm, platform) {
	const mode = platform.task
	let model = null;
	const builder = new NeuralNetworkBuilder()

	let lock = false;

	const fitModel = (cb) => {
		if (!model) {
			cb && cb();
			return
		}
		if (lock) return;
		lock = true;
		const iteration = +elm.select("[name=iteration]").property("value");
		const batch = +elm.select("[name=batch]").property("value");
		const rate = +elm.select("[name=rate]").property("value");
		const predCount = +elm.select("[name=pred_count]").property("value");
		const dim = getInputDim()

		platform.plot(
			(tx, ty, px, pred_cb) => {
				const x = Matrix.fromArray(tx)
				if (mode === 'TP') {
					ty = tx.slice(dim)
					tx = []
					for (let i = 0; i < x.rows - dim; i++) {
						tx.push(x.sliceRow(i, i + dim).value)
					}
				} else if (model.output_size) {
					const y = Matrix.zeros(ty.length, model.output_size)
					ty.forEach((t, i) => y.set(i, t[0], 1))
					ty = y.toArray()
				}
				model.fit(tx, ty, iteration, rate, batch, (e) => {
					if (mode === 'TP') {
						let lx = x.sliceRow(x.rows - dim).value
						const p = []
						const predNext = () => {
							if (p.length >= predCount) {
								pred_cb(p)

								lock = false;
								cb && cb();
								return
							}
							model.predict([lx], e => {
								const d = e.data[0]
								p.push(e.data[0])
								lx = lx.slice(x.cols)
								lx.push(...e.data[0])
								predNext()
							})
						}
						predNext()
					} else {
						model.predict(px, (e) => {
							const data = (mode == "CF") ? Matrix.fromArray(e.data).argmax(1).value : e.data
							pred_cb(data);

							lock = false;
							cb && cb();
						});
					}
				});
			}, dim === 1 ? 2 : 4
		);
	};

	const getInputDim = () => {
		return (mode === "TP") ? +elm.select("[name=width]").property("value") : platform.datas.dimension || 2;
	}

	if (mode === 'TP') {
		elm.append("span")
			.text("window width")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "width")
			.attr("min", 1)
			.attr("max", 1000)
			.attr("value", 20)
	}
	elm.append("span")
		.text(" Hidden Layers ");
	builder.makeHtml(elm)
	elm.append("span")
		.attr("id", "mlp_model")
		.append("mlp_model");
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		if (platform.datas.length == 0) {
			return;
		}
		if (!model) model = new MLP();

		const dim = getInputDim()

		let model_classes = (mode == "CF") ? Math.max.apply(null, platform.datas.y) + 1 : 0;
		model.initialize(dim, model_classes, builder.layers);
		platform.init()
	});
	elm.append("span")
		.text(" Iteration ");
	elm.append("select")
		.attr("name", "iteration")
		.selectAll("option")
		.data([1, 10, 100, 1000, 10000])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" Learning rate ");
	elm.append("select")
		.attr("name", "rate")
		.selectAll("option")
		.data([0.001, 0.01, 0.1, 1, 10])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" Batch size ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "batch")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.attr("step", 1);
	slbConf.step(fitModel).epoch(() => model.epoch)
	if (mode === 'TP') {
		elm.append("span")
			.text(" predict count")
		elm.append("input")
			.attr("type", "number")
			.attr("name", "pred_count")
			.attr("min", 1)
			.attr("max", 1000)
			.attr("value", 100)
	} else {
		elm.append("input")
			.attr("type", "hidden")
			.attr("name", "pred_count")
			.property("value", 0)
	}

	slbConf.initialize()
	return () => {
		slbConf.stop()
		model && model.terminate();
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.ternimate = dispMLP(platform.setting.ml.configElement, platform)
}
