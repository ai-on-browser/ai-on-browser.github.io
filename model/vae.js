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

	predict(id, x, cb) {
		this._postMessage({
			id: id,
			mode: "predict",
			x: x
		}, cb);
	}
}

var dispVAE = function(elm, mode, setting) {
	const svg = d3.select("svg");
	let model = null;
	let aeNetId = null;
	let genNetId = null;

	let lock = false;

	const fitModel = (cb) => {
		if (!model) return;
		if (lock) return;
		lock = true;
		const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");

		FittingMode.GR.fit(svg, points, noise_dim,
			(tx, ty, px, pred_cb) => {
				model.fit(aeNetId, tx, tx, iteration, rate, (e) => {
					const epoch = e.data.epoch;
					model.predict(genNetId, px, (e) => {
						const data = e.data;
						const type = elm.select(".buttons [name=type]").property("value");
						if (type === 'conditional') {
							pred_cb(data, ty);
						} else {
							pred_cb(data);
						}
						elm.select(".buttons [name=epoch]").text(epoch);
						lock = false;
						cb && cb();
					});
				});
			}
		);
	};

	const genValues = (cb) => {
		const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
		FittingMode.GR.fit(svg, points, noise_dim,
			(tx, ty, px, pred_cb) => {
				model.predict(genNetId, px, (e) => {
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
			if (points.length == 0) {
				return;
			}
			if (!model) model = new VAEWorker();
			const noise_dim = +elm.select(".buttons [name=noise_dim]").property("value");
			const hidden = +elm.select(".buttons [name=hidden]").property("value");
			const type = elm.select(".buttons [name=type]").property("value");

			let commonLayers = [
				{type: 'input'},
				{type: 'full', out_size: hidden},
				{type: 'tanh'},
				{type: 'full', out_size: 2}
			]
			let aeLayers = []
			let genLayers = []
			if (type === 'conditional') {
			} else {
				aeLayers.push(
					{type: 'input'},
					{type: 'full', out_size: hidden},
					{type: 'tanh'},
					{type: 'full', out_size: noise_dim * 2},
					{type: 'split', size: [noise_dim, noise_dim], name: 'param'},
					{type: 'random', size: noise_dim, input: [], name: 'random'},
					{type: 'mult', input: ['random', 'param[0]'], name: 'mult'},
					{type: 'add', input: ['mult', 'param[1]']}
				);
				genLayers.push({type: 'input'})
			}
			// TODO create loss
			model.initialize(commonLayers, (e) => {
				const commonId = e.data;
				aeLayers.push(
					{type: 'include', id: commonId, train: true}
				);
				genLayers.push(
					{type: 'include', id: commonId, train: true}
				);
				model.initialize(aeLayers, (e) => {
					aeNetId = e.data;
					model.initialize(genLayers, (e) => {
						genNetId = e.data;
					});
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

var vae_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispVAE(root, mode, setting);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
		termCallback();
	});
}

