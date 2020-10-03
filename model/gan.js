class GANWorker extends BaseWorker {
	constructor() {
		super('model/neuralnetwork_worker.js');
	}

	initialize(layers, cb) {
		this._postMessage({
			mode: "init",
			layers: layers,
			loss: 'mse'
		}, cb);
	}

	fit(id, train_x, train_y, iteration, rate, cb) {
		this._postMessage({
			id: id,
			mode: "fit",
			x: train_x,
			y: train_y,
			iteration: iteration,
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

	init(noise_dim, g_hidden, d_hidden, type) {
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
				{type: 'onehot', name: 'cond_oh', input: ['cond']},
				{type: 'concat', input: ['dic_in', 'cond_oh']}
			);
			generatorNetLeyers.push(
				{type: 'input', name: 'cond', input: []},
				{type: 'onehot', name: 'cond_oh', input: ['cond']},
				{type: 'concat', input: ['gen_in', 'cond_oh']}
			);
		}
		discriminatorNetLayers.push(
			{type: 'full', out_size: d_hidden, activation: 'tanh'},
			{type: 'full', out_size: d_hidden, activation: 'tanh'},
			{type: 'full', out_size: 2},
			{type: 'softmax'}
		);
		generatorNetLeyers.push(
			{type: 'full', out_size: g_hidden, activation: 'tanh'},
			{type: 'full', out_size: g_hidden, activation: 'tanh'},
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

	fit(x, y, step, gen_rate, dis_rate, cb) {
		const cond = y;
		const cond2 = [].concat(cond, cond);
		y = Array(x.length).fill([1, 0]);
		for (let i = 0; i < x.length; i++) {
			y.push([0, 1]);
		}
		const true_out = Array(x.length).fill([1, 0]);
		const loop = () => {
			this.generate(x.length, cond, (gen_data) => {
				this._model.fit(this._discriminatorNetId, { dic_in: [].concat(x, gen_data), cond: cond2 }, y, 1, dis_rate, (e) => {
					const gen_noise = Matrix.randn(x.length, this._noise_dim).toArray();
					this._model.fit(this._generatorNetId, { gen_in: gen_noise, cond: cond }, true_out, 1, gen_rate, (e) => {
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
	let model = null;

	let lock = false;

	const fitModel = (cb) => {
		if (!model || platform.datas.length === 0) {
			cb && cb();
			return;
		}
		if (lock) return;
		lock = true;
		const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const gen_rate = +elm.select(".buttons [name=gen_rate]").property("value");
		const dis_rate = +elm.select(".buttons [name=dis_rate]").property("value");

		platform.plot(
			(tx, ty, px, pred_cb, tile_cb) => {
				model.fit(tx, ty, iteration, gen_rate, dis_rate, (gen_data) => {
					if (model._type === 'conditional') {
						pred_cb(gen_data, ty);
						elm.select(".buttons [name=epoch]").text(model.epoch);
						lock = false;
						cb && cb();
					} else {
						model.prob(px, null, (pred_data) => {
							tile_cb(pred_data.map(v => specialCategory.errorRate(v[1])));
							pred_cb(gen_data);
							elm.select(".buttons [name=epoch]").text(model.epoch);
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
					const type = elm.select(".buttons [name=type]").property("value");
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

	elm.select(".buttons")
		.append("select")
		.attr("name", "type")
		.selectAll("option")
		.data(["default", "conditional"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("span")
		.text("Noise dim")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "noise_dim")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
	elm.select(".buttons")
		.append("span")
		.text("Hidden size ")
	const ganHiddensDiv = elm.select(".buttons")
		.append("div")
		.style("display", "inline-block")
	for (const v of [{ name: 'g_hidden_num', title: 'G', value: 10 }, { name: 'd_hidden_num', title: 'D', value: 10 }]) {
		const ghd = ganHiddensDiv.append("div")
		ghd.append("span").text(v.title)
		ghd.append("input")
			.attr("type", "number")
			.attr("name", v.name)
			.attr("min", 1)
			.attr("max", 100)
			.attr("value", v.value)
	}
	const initButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			if (!model) model = new GAN();
			const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
			const g_hidden = +elm.select(".buttons [name=g_hidden_num]").property("value");
			const d_hidden = +elm.select(".buttons [name=d_hidden_num]").property("value");
			const type = elm.select(".buttons [name=type]").property("value");
			model.init(noise_dim, g_hidden, d_hidden, type)

			elm.select(".buttons [name=epoch]").text(0);
			platform.init()
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
		.text("Learning rate ")
	const ganRatesDiv = elm.select(".buttons")
		.append("div")
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
		grd.select(`.buttons [name=${v.name}]`)
			.property("value", v.value)
	}
	const fitButton = elm.select(".buttons")
		.append("input")
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
	const runButton = elm.select(".buttons")
		.append("input")
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
	elm.select(".buttons")
		.append("span")
		.text(" Epoch: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "epoch");
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Generate")
		.on("click", genValues);

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model && model.terminate();
	};
}

var gan_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispGAN(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default gan_init

