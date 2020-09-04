class VAEWorker extends BaseWorker {
	constructor() {
		super('model/neuralnetwork_worker.js');
	}

	initialize(layers, cb) {
		this._postMessage({
			mode: "init",
			layers: layers
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

class VAE {
	// https://tips-memo.com/vae-pytorch
	// https://nzw0301.github.io/assets/pdf/vae.pdf
	constructor() {
		this._model = new VAEWorker()

		this._commonNetId = null
		this._aeNetId = null
		this._genNetId = null
	}

	get epoch() {
		return this._epoch
	}

	init(in_size, noise_dim, hidden, type) {
		if (this._commonNetId) {
			this._model.remove(this._commonNetId)
			this._model.remove(this._aeNetId)
			this._model.remove(this._genNetId)
		}
		this._type = type
		this._reconstruct_rate = 10

		let commonLayers = [{type: 'input', name: 'dec_in'}]
		if (type === 'conditional') {
			commonLayers.push(
				{type: 'input', name: 'cond', input: []},
				{type: 'onehot', name: 'cond_oh', input: ['cond']},
				{type: 'concat', input: ['dec_in', 'cond_oh']}
			)
		}
		commonLayers.push(
			{type: 'full', out_size: hidden, activation: 'tanh'},
			{type: 'full', out_size: in_size}
		)
		let aeLayers = [{type: 'input', name: 'enc_in'}]
		if (type === 'conditional') {
			aeLayers.push(
				{type: 'input', name: 'cond', input: []},
				{type: 'onehot', name: 'cond_oh', input: ['cond']},
				{type: 'concat', input: ['enc_in', 'cond_oh']}
			)
		}
		aeLayers.push(
			{type: 'full', out_size: hidden, activation: 'tanh'},
			{type: 'full', out_size: hidden, activation: 'tanh'},
			{type: 'full', out_size: noise_dim * 2},
			{type: 'split', size: [noise_dim, noise_dim], name: 'param'},
			{type: 'abs', input: ['param[0]'], name: 'var'},
			{type: 'linear', input: ['param[1]'], name: 'mean'},
			{type: 'random', size: noise_dim, input: [], name: 'random'},
			{type: 'mult', input: ['random', 'var'], name: 'mult'},
			{type: 'add', input: ['mult', 'mean']}
		);
		let genLayers = [{type: 'input', name: 'gen_in'}]
		this._model.initialize(commonLayers, (e) => {
			this._commonNetId = e.data;
			aeLayers.push(
				{type: 'include', id: this._commonNetId, input_to: 'dec_in', train: true},
				{type: 'output', name: 'output'},
				{type: 'log', input: 'var', name: 'log_var'},
				{type: 'square', input: 'mean', name: 'mean^2'},
				{type: 'add', input: [1, 'log_var'], name: 'add'},
				{type: 'sub', input: ['add', 'mean^2', 'var']},
				{type: 'sum', axis: 1},
				{type: 'mean', name: 'kl_0'},
				{type: 'mult', input: ['kl_0', -0.5 / this._reconstruct_rate]},
				{type: 'sum', name: 'kl'},

				{type: 'sub', input: ['enc_in', 'output']},
				{type: 'square'},

				//{type: 'log', input: 'output', name: 'log_y'},
				//{type: 'mult', input: ['input', 'log_y'], name: 'x*log_y'},
				//{type: 'sub', input: [1, 'input'], name: '1-x'},
				//{type: 'sub', input: [1, 'output']},
				//{type: 'log', name: 'log_1-y'},
				//{type: 'mult', input: ['1-x', 'log_1-y'], name: '1-x*log_1-y'},
				//{type: 'add', input: ['x*log_y', '1-x*log_1-y']},
				//{type: 'sum', axis: 1},
				{type: 'mean', name: 'recon'},
				{type: 'add', input: ['kl', 'recon']},
			);
			genLayers.push(
				{type: 'include', id: this._commonNetId, input_to: 'dec_in', train: true}
			);
			this._model.initialize(aeLayers, (e) => {
				this._aeNetId = e.data;
				this._model.initialize(genLayers, (e) => {
					this._genNetId = e.data;
				});
			});
		});
	}

	terminate() {
		this._model.terminate();
	}

	fit(x, y, iteration, rate, cb) {
		this._model.fit(this._aeNetId, {enc_in: x, cond: y}, x, iteration, rate, (e) => {
			this._epoch = e.data.epoch;
			cb && cb();
		});
	}

	predict(x, y, out, cb) {
		this._model.predict(this._aeNetId, {enc_in: x, cond: y}, out, cb);
	}
}

var dispVAE = function(elm, setting, platform) {
	// https://mtkwt.github.io/post/vae/
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
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");

		if (mode === 'DR') {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					model.fit(tx, ty, iteration, rate, () => {
						model.predict(tx, ty, ['mean'], (e) => {
							const data = Matrix.fromArray(e.data.mean).value;
							pred_cb(data);
							elm.select(".buttons [name=epoch]").text(model.epoch);
							lock = false;
							cb && cb();
						});
					});
				}
			);
		} else if (mode === 'GR') {
			platform.plot(
				(tx, ty, px, pred_cb, tile_cb) => {
					model.fit(tx, ty, iteration, rate, (e) => {
						model.predict(tx, ty, null, (e) => {
							const data = e.data;
							if (model._type === 'conditional') {
								pred_cb(data, ty);
							} else {
								pred_cb(data);
							}
							elm.select(".buttons [name=epoch]").text(model.epoch);
							lock = false;
							cb && cb();
						});
					});
				}, 5
			)
		}
	};

	const genValues = (cb) => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				model.predict(tx, null, (e) => {
					const data = e.data;
					const type = elm.select(".buttons [name=type]").property("value");
					if (type === 'conditional') {
						pred_cb(data, ty);
					} else {
						pred_cb(data);
					}
					cb && cb();
				});
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
	if (mode !== 'DR') {
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
	}
	elm.select(".buttons")
		.append("span")
		.text("Hidden size ")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "hidden")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 10)
	const initButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			if (platform.datas.length == 0) {
				return;
			}
			if (!model) model = new VAE();
			const noise_dim = setting.dimension || +elm.select(".buttons [name=noise_dim]").property("value");
			const hidden = +elm.select(".buttons [name=hidden]").property("value");
			const type = elm.select(".buttons [name=type]").property("value");
			model.init(platform.datas.dimension, noise_dim, hidden, type)

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
	elm.select(".buttons")
		.append("select")
		.attr("name", "rate")
		.selectAll("option")
		.data([0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
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
		.on("click", () => {
			isRunning = !isRunning;
			runButton.attr("value", (isRunning) ? "Stop" : "Run");
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
	if (mode === 'GR') {
		elm.select(".buttons")
			.append("input")
			.attr("type", "button")
			.attr("value", "Generate")
			.on("click", genValues);
	}

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model && model.terminate();
	};
}

var vae_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispVAE(root, setting, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default vae_init

