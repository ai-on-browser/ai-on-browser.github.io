class MLPWorker extends BaseWorker {
	constructor() {
		super('model/neuralnetwork_worker.js');
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
			"batch": batch,
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
		for (let i = 0; i < layers.length; i++) {
			this._layers.push({
				type: 'full',
				out_size: layers[i].size
			})
			this._layers.push({
				type: layers[i].a,
				n: layers[i].poly_pow
			})
		}
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

const mlp_layers = [
	{
		"size": 10,
		"a": "sigmoid",
		"poly_pow": 2
	}
];

Vue.component('mlp_model', {
	data: function() {
		return {
			layers: mlp_layers
		}
	},
	template: `
	<div style="display: inline-block">
		<div v-for="layer, i in layers" :key="i">
			#{{ i + 1 }}
			Size: <input v-model="layer.size" type="number" min="1" max="100">
			Activation: <select v-model="layer.a">
				<option v-for="a in ['sigmoid', 'tanh', 'relu', 'leaky_relu', 'softsign', 'softplus', 'linear', 'polynomial', 'abs']" :value="a">{{ a }}</option>
			</select>
			<input v-if="layer.a === 'polynomial'" v-model="layer.poly_pow" type="number" min="1" max="10">
			<input v-if="layers.length > 0" type="button" value="x" v-on:click="layers.splice(i, 1)">
		</div>
		<input v-if="layers.length < 10" type="button" value="+" v-on:click="addLayer">
	</div>
	`,
	created() {
		this.layers.length = 1
		this.layers[0] = {
			size: 10,
			a: "sigmoid",
			poly_pow: 2
		}
	},
	methods: {
		addLayer() {
			this.layers.push({
				size: 10,
				a: "sigmoid",
				poly_pow: 2
			});
		}
	}
});

var dispMLP = function(elm, platform) {
	const mode = platform.task
	let model = null;

	let lock = false;

	const fitModel = (cb) => {
		if (!model) {
			cb && cb();
			return
		}
		if (lock) return;
		lock = true;
		const iteration = +elm.select(".buttons [name=iteration]").property("value");
		const batch = +elm.select(".buttons [name=batch]").property("value");
		const rate = +elm.select(".buttons [name=rate]").property("value");
		const predCount = +elm.select(".buttons [name=pred_count]").property("value");
		const dim = getInputDim()

		platform.plot(
			(tx, ty, px, pred_cb) => {
				const x = Matrix.fromArray(tx)
				if (mode === 'TP') {
					ty = tx.slice(dim)
					tx = []
					for (let i = 0; i < x.rows - dim; i++) {
						tx.push(x.select(i, null, i + dim).value)
					}
				} else if (model.output_size) {
					const y = Matrix.zeros(ty.length, model.output_size)
					ty.forEach((t, i) => y.set(i, t[0], 1))
					ty = y.toArray()
				}
				model.fit(tx, ty, iteration, rate, batch, (e) => {
					if (mode === 'TP') {
						let lx = x.select(x.rows - dim).value
						const p = []
						const predNext = () => {
							if (p.length >= predCount) {
								pred_cb(p)

								elm.select(".buttons [name=epoch]").text(model.epoch);
								lock = false;
								cb && cb();
								return
							}
							model.predict([lx], e => {
								const d = e.data[0]
								p.push(e.data[0][0])
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
							elm.select(".buttons [name=epoch]").text(model.epoch);

							lock = false;
							cb && cb();
						});
					}
				});
			}, dim === 1 ? 2 : 4
		);
	};

	const getInputDim = () => {
		return (mode === "TP") ? +elm.select(".buttons [name=width]").property("value") : platform.datas.dimension || 2;
	}

	if (mode === 'TP') {
		elm.select(".buttons")
			.append("span")
			.text("window width")
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "width")
			.attr("min", 1)
			.attr("max", 1000)
			.attr("value", 20)
	}
	elm.select(".buttons")
		.append("span")
		.text(" Hidden Layers ");
	elm.select(".buttons")
		.append("span")
		.attr("id", "mlp_model")
		.append("mlp_model");
	const initButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			elm.select(".buttons [name=epoch]").text(0);
			if (platform.datas.length == 0) {
				return;
			}
			if (!model) model = new MLP();

			const dim = getInputDim()

			let model_classes = (mode == "CF") ? Math.max.apply(null, platform.datas.y) + 1 : 0;
			model.initialize(dim, model_classes, mlp_layers);
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
	if (mode === 'TP') {
		elm.select(".buttons")
			.append("span")
			.text(" predict count")
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "pred_count")
			.attr("min", 1)
			.attr("max", 1000)
			.attr("value", 100)
	} else {
		elm.select(".buttons")
			.append("input")
			.attr("type", "hidden")
			.attr("name", "pred_count")
			.property("value", 0)
	}
	new Vue({
		el: "#mlp_model"
	});

	initButton.dispatch("click");
	return () => {
		isRunning = false;
		model && model.terminate();
	};
}

var mlp_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispMLP(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default mlp_init

