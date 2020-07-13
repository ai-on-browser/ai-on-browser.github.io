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

var dispGAN = function(elm, mode, setting) {
	const svg = d3.select("svg");
	let model = null;
	let discriminatorNetId = null;
	let generatorNetId = null;

	let lock = false;

	const fitModel = (cb) => {
		if (!model || points.length === 0) {
			cb && cb();
			return;
		}
		if (lock) return;
		lock = true;
		const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const gen_rate = +elm.select(".buttons [name=gen_rate]").property("value");
		const dis_rate = +elm.select(".buttons [name=dis_rate]").property("value");

		FittingMode.GR.fit(svg, setting.points, 5,
			(tx, ty, px, pred_cb, tile_cb) => {
				const cond = ty;
				const cond2 = [].concat(cond, cond);
				ty = Array(tx.length).fill([1, 0]);
				for (let i = 0; i < tx.length; i++) {
					ty.push([0, 1]);
				}
				const true_out = Array(tx.length).fill([1, 0]);
				const fitStep = (step) => {
					const gen_noise = Matrix.randn(tx.length, noise_dim).toArray();
					model.predict(generatorNetId, { gen_in: gen_noise, cond: cond }, ['generate'], (e) => {
						const gen_data = e.data.generate;
						model.fit(discriminatorNetId, { dic_in: [].concat(tx, gen_data), cond: cond2 }, ty, 1, dis_rate, (e) => {
							model.fit(generatorNetId, { gen_in: gen_noise, cond: cond }, true_out, 1, gen_rate, (e) => {
								if (step >= iteration) {
									const epoch = e.data.epoch
									const type = elm.select(".buttons [name=type]").property("value");
									if (type === 'conditional') {
										pred_cb(gen_data, cond);
										elm.select(".buttons [name=epoch]").text(epoch);
										lock = false;
										cb && cb();
									} else {
										model.predict(discriminatorNetId, {dic_in: px}, null, (e) => {
											const pred_data = e.data
											tile_cb(pred_data.map(v => -1 - v[0]));
											pred_cb(gen_data);
											elm.select(".buttons [name=epoch]").text(epoch);
											lock = false;
											cb && cb();
										})
									}
								} else {
									fitStep(step + 1);
								}
							});
						});
					});
				}
				fitStep(1);
			}
		);
	};

	const genValues = (cb) => {
		const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
		FittingMode.GR.fit(svg, setting.points, noise_dim,
			(tx, ty, px, pred_cb) => {
				model.predict(generatorNetId, { gen_in: px, cond: ty }, ['generate'], (e) => {
					const gen_data = e.data.generate;
					const type = elm.select(".buttons [name=type]").property("value");
					if (type === 'conditional') {
						pred_cb(gen_data, ty);
					} else {
						pred_cb(gen_data);
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
		.data(["", "conditional"])
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
			if (!model) model = new GANWorker();
			const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
			const g_hidden = +elm.select(".buttons [name=g_hidden_num]").property("value");
			const d_hidden = +elm.select(".buttons [name=d_hidden_num]").property("value");
			const type = elm.select(".buttons [name=type]").property("value");

			let discriminatorNetLayers = []
			let generatorNetLeyers = []
			if (type === 'conditional') {
				discriminatorNetLayers.push(
					{type: 'input', name: 'dic_in'},
					{type: 'input', name: 'cond', input: []},
					{type: 'onehot', name: 'cond_oh', input: ['cond']},
					{type: 'concat', input: ['dic_in', 'cond_oh']}
				);
				generatorNetLeyers.push(
					{type: 'input', name: 'gen_in'},
					{type: 'input', name: 'cond', input: []},
					{type: 'onehot', name: 'cond_oh', input: ['cond']},
					{type: 'concat', input: ['gen_in', 'cond_oh']}
				);
			} else {
				discriminatorNetLayers.push({type: 'input', name: 'dic_in'});
				generatorNetLeyers.push({type: 'input', name: 'gen_in'});
			}
			discriminatorNetLayers.push(
				{type: 'full', out_size: d_hidden},
				{type: 'tanh'},
				{type: 'full', out_size: d_hidden},
				{type: 'tanh'},
				{type: 'full', out_size: 2},
				{type: 'softmax'}
			);
			generatorNetLeyers.push(
				{type: 'full', out_size: g_hidden},
				{type: 'tanh'},
				{type: 'full', out_size: g_hidden},
				{type: 'tanh'},
				{type: 'full', out_size: 2},
				{type: 'leaky_relu', a: 0.1, name: 'generate'}
			);
			model.remove(discriminatorNetId);
			model.remove(generatorNetId);
			model.initialize(discriminatorNetLayers, (e) => {
				discriminatorNetId = e.data;
				generatorNetLeyers.push(
					{type: 'include', id: discriminatorNetId, input_name: 'dic_in', train: false}
				);
				model.initialize(generatorNetLeyers, (e) => {
					generatorNetId = e.data;
				});
			});
			elm.select(".buttons [name=epoch]").text(0);
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

var gan_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispGAN(root, mode, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}

