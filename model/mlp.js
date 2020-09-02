class MLPWorker extends BaseWorker {
	constructor() {
		super('model/mlp_worker.js');
	}

	initialize(type, sizes, activation) {
		this._postMessage({
			"mode": "init",
			"type": type,
			"size": sizes,
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

class MLP {
	constructor(input_size, output_size, hidden_sizes, activations) {
		this._model = new MLPWorker()
	}

	get type() {
		return this._type
	}

	get output_size() {
		return this._sizes[this._sizes.length - 1]
	}

	get epoch() {
		return this._epoch
	}

	initialize(input_size, output_size, hidden_sizes, activations) {
		this._type = output_size ? "classifier" : "regression"
		this._sizes = [input_size, ...hidden_sizes, output_size || 1]
		this._activations = activations

		this._model.initialize(this._type, this._sizes, activations)
	}

	terminate() {
		this._model.terminate()
	}

	fit(train_x, train_y, iteration, rate, batch, cb) {
		this._model.fit(train_x, train_y, iteration, rate, batch, e => {
			this._epoch = e.data
			cb && cb(e)
		})
	}

	predict(x, cb) {
		this._model.predict(x, cb)
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
		const dim = platform.datas.dimension || 2;

		platform.plot(
			(tx, ty, px, pred_cb) => {
				model.fit(tx, ty, iteration, rate, batch, (e) => {
					model.predict(px, (e) => {
						pred_cb(e.data);
						elm.select(".buttons [name=epoch]").text(model.epoch);

						lock = false;
						cb && cb();
					});
				});
			}, dim === 1 ? 2 : 4
		);
	};

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

			const dim = platform.datas.dimension || 2;
			let activation = mlp_layers.map(l => {
				if (l.a == "polynomial") {
					return [l.a, l.poly_pow];
				}
				return [l.a];
			});
			const hidden_number = mlp_layers.map(l => l.size);

			let model_classes = (mode == "CF") ? Math.max.apply(null, platform.datas.y) + 1 : 0;
			model.initialize(dim, model_classes, hidden_number, activation);
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

