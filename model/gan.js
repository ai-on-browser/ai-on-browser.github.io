class GANWorker extends BaseWorker {
	constructor() {
		super('model/worker/neuralnetwork_worker.js');
	}

	initialize(layers, cb) {
		this._postMessage({
			mode: "init",
			layers: layers,
			loss: 'mse'
		}, cb);
	}

	fit(id, train_x, train_y, iteration, rate, batch, cb) {
		this._postMessage({
			id: id,
			mode: "fit",
			x: train_x,
			y: train_y,
			iteration: iteration,
			batch_size: batch,
			rate: rate
		}, cb);
	}

	predict(id, x, out, cb) {
		this._postMessage({
			id: id,
			mode: "predict",
			x: x,
			out: out
		}, cb);
	}

	remove(id) {
		this._postMessage({
			id: id,
			mode: "close"
		});
	}
}

class GAN {
	constructor() {
		this._model = new GANWorker();

		this._discriminatorNetId = null
		this._generatorNetId = null
	}

	get epoch() {
		return this._epoch
	}

	init(noise_dim, g_hidden, d_hidden, class_size, type) {
		if (this._discriminatorNetId) {
			this._model.remove(this._discriminatorNetId);
			this._model.remove(this._generatorNetId);
		}
		this._type = type
		this._noise_dim = noise_dim
		let discriminatorNetLayers = [{type: 'input', name: 'dic_in'}]
		let generatorNetLeyers = [{type: 'input', name: 'gen_in'}]
		if (type === 'conditional') {
			discriminatorNetLayers.push(
				{type: 'input', name: 'cond', input: []},
				{type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size},
				{type: 'concat', input: ['dic_in', 'cond_oh']}
			);
			generatorNetLeyers.push(
				{type: 'input', name: 'cond', input: []},
				{type: 'onehot', name: 'cond_oh', input: ['cond'], class_size: class_size},
				{type: 'concat', input: ['gen_in', 'cond_oh']}
			);
		}
		discriminatorNetLayers.push(
			...d_hidden,
			{type: 'full', out_size: 2},
			{type: 'softmax'}
		);
		generatorNetLeyers.push(
			...g_hidden,
			{type: 'full', out_size: 2},
			{type: 'leaky_relu', a: 0.1, name: 'generate'}
		);
		this._model.initialize(discriminatorNetLayers, (e) => {
			this._discriminatorNetId = e.data;
			generatorNetLeyers.push(
				{type: 'include', id: this._discriminatorNetId, input_to: 'dic_in', train: false}
			);
			this._model.initialize(generatorNetLeyers, (e) => {
				this._generatorNetId = e.data;
			});
		});
	}

	terminate() {
		this._model.terminate();
	}

	fit(x, y, step, gen_rate, dis_rate, batch, cb) {
		const cond = y;
		const cond2 = [].concat(cond, cond);
		y = Array(x.length).fill([1, 0]);
		for (let i = 0; i < x.length; i++) {
			y.push([0, 1]);
		}
		const true_out = Array(x.length).fill([1, 0]);
		const loop = () => {
			this.generate(x.length, cond, (gen_data) => {
				this._model.fit(this._discriminatorNetId, { dic_in: [].concat(x, gen_data), cond: cond2 }, y, 1, dis_rate, batch, (e) => {
					const gen_noise = Matrix.randn(x.length, this._noise_dim).toArray();
					this._model.fit(this._generatorNetId, { gen_in: gen_noise, cond: cond }, true_out, 1, gen_rate, batch, (e) => {
						this._epoch = e.data.epoch
						if (--step <= 0) {
							cb && cb(gen_data);
						} else {
							loop();
						}
					})
				})
			})
		}
		loop()
	}

	prob(x, y, cb) {
		this._model.predict(this._discriminatorNetId, {dic_in: x, cond: y}, null, (e) => {
			const pred_data = e.data
			cb && cb(pred_data)
		})
	}

	generate(n, y, cb) {
		const gen_noise = Matrix.randn(n, this._noise_dim).toArray();
		this._model.predict(this._generatorNetId, { gen_in: gen_noise, cond: y }, ['generate'], (e) => {
			const gen_data = e.data.generate;
			cb && cb(gen_data);
		})
	}
}

var dispGAN = function(elm, platform) {
	const mode = platform.task
	const gbuilder = new NeuralNetworkBuilder()
	const dbuilder = new NeuralNetworkBuilder()
	let model = null;

	let lock = false;

	const fitModel = (cb) => {
		if (!model || platform.datas.length === 0) {
			cb && cb();
			return;
		}
		if (lock) return;
		lock = true;
		const noise_dim = +elm.select("[name=noise_dim]").property("value");
		const iteration = +elm.select("[name=iteration]").property("value");
		const gen_rate = +elm.select("[name=gen_rate]").property("value");
		const dis_rate = +elm.select("[name=dis_rate]").property("value");
		const batch = +elm.select("[name=batch]").property("value");

		platform.plot(
			(tx, ty, px, pred_cb, tile_cb) => {
				model.fit(tx, ty, iteration, gen_rate, dis_rate, batch, (gen_data) => {
					if (model._type === 'conditional') {
						pred_cb(gen_data, ty);
						elm.select("[name=epoch]").text(model.epoch);
						lock = false;
						cb && cb();
					} else {
						model.prob(px, null, (pred_data) => {
							tile_cb(pred_data.map(v => specialCategory.errorRate(v[1])));
							pred_cb(gen_data);
							elm.select("[name=epoch]").text(model.epoch);
							lock = false;
							cb && cb();
						})
					}
				});
			}, 5
		);
	};

	const genValues = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				model.generate(tx.length, ty, (gen_data) => {
					const type = elm.select("[name=type]").property("value");
					if (type === 'conditional') {
						pred_cb(gen_data, ty);
					} else {
						pred_cb(gen_data);
					}
					cb && cb();
				})
			}
		);
	};

	elm.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["default", "conditional"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("Noise dim")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "noise_dim")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
	elm.append("span")
		.text("Hidden size ")
	const ganHiddensDiv = elm.append("div")
		.style("display", "inline-block")
	const gHiddensDiv = ganHiddensDiv.append("div")
	gHiddensDiv.append("span").text("G")
	gbuilder.makeHtml(gHiddensDiv)
	const dHiddensDiv = ganHiddensDiv.append("div")
	dHiddensDiv.append("span").text("D")
	dbuilder.makeHtml(dHiddensDiv)
	const initButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			if (!model) model = new GAN();
			const noise_dim = +elm.select("[name=noise_dim]").property("value");
			const g_hidden = gbuilder.layers
			const d_hidden = dbuilder.layers
			const type = elm.select("[name=type]").property("value");
			platform.plot((tx, ty, px, pred_cb, tile_cb) => {
				const class_size = [...new Set(ty.map(v => v[0]))].length
				model.init(noise_dim, g_hidden, d_hidden, class_size, type)
			})

			elm.select("[name=epoch]").text(0);
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
		.text("Learning rate ")
	const ganRatesDiv = elm.append("div")
		.style("display", "inline-block")
	for (const v of [{ name: 'gen_rate', title: 'G', value: 0.01 }, { name: 'dis_rate', title: 'D', value: 0.5 }]) {
		const grd = ganRatesDiv.append("div")
		grd.append("span")
			.text(v.title);
		grd.append("select")
			.attr("name", v.name)
			.selectAll("option")
			.data([0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
		grd.select(`[name=${v.name}]`)
			.property("value", v.value)
	}
	elm.append("span")
		.text(" Batch size ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "batch")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
		.attr("step", 1);
	const fitButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			fitButton.property("disabled", true);
			runButton.property("disabled", true);
			fitModel(() => {
				fitButton.property("disabled", false);
				runButton.property("disabled", false);
			})
		});
	let isRunning = false;
	const runButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			if (isRunning) {
				(function stepLoop() {
					if (isRunning) {
						fitModel(() => setTimeout(stepLoop, 0));
					}
					fitButton.property("disabled", isRunning);
					runButton.property("disabled", false);
				})();
			} else {
				runButton.property("disabled", true);
			}
		});
	elm.append("span")
		.text(" Epoch: ");
	elm.append("span")
		.attr("name", "epoch");
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Generate")
		.on("click", genValues);

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model && model.terminate();
	};
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	platform.setting.terminate = dispGAN(platform.setting.ml.configElement, platform);
}
