import { KMeans, KMeansModelPlotter } from './kmeans.js'

class NeuralGas extends KMeans {
	// https://en.wikipedia.org/wiki/Neural_gas
	constructor(l = 1, m = 0.99) {
		super()
		this._l = l;
		this._eps = 1;
		this._epoch = 0;
		this._sample_rate = 0.8;
		this._m = m;
	}

	move(model, centroids, datas) {
		const x = datas.filter(v => Math.random() < this._sample_rate);
		this._epoch++;
		const cvec = centroids;
		const distances = x.map(v => {
			let ds = cvec.map((c, i) => [i, this._distance(v, c)])
			ds.sort((a, b) => a[1] - b[1]);
			ds = ds.map((d, k) => [d[0], d[1], k])
			ds.sort((a, b) => a[0] - b[0]);
			return ds;
		})
		this._l *= this._m
		return cvec.map((c, n) => {
			const update = Array(x[0].length).fill(0)
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					update[j] += (x[i][j] - c[j]) * this._eps * Math.exp(-distances[i][n][2] / this._l)
				}
			}
			return update.map((v, i) => c[i] + v / x.length)
		});
	}
}

var dispNeuralGas = function(elm, platform) {
	const svg = platform.svg;

	const kmns = new KMeansModelPlotter(svg, platform.datas);
	kmns.method = new NeuralGas();
	kmns._duration = 100
	let isRunning = false;

	const fitPoints = () => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const pred = kmns._model.predict(px);
				pred_cb([], pred.map(v => v + 1))
				elm.select("[name=l]").property("value", kmns.method._l)
			}, 4, 1
		);
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			kmns.clearCentroids();
			const l = +elm.select("[name=l]").property("value")
			const m = +elm.select("[name=m]").property("value")
			kmns.method = new NeuralGas(l, m);
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
			platform.init()
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", () => {
			kmns.addCentroid();
			kmns.categorizePoints();
			fitPoints();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	elm.append("span")
		.text(" l ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "l")
		.attr("max", 10)
		.attr("step", 0.1)
		.attr("value", 1)
		.on("change", () => {
			const l = +elm.select("[name=l]").property("value")
			kmns.method._l = l
		})
	elm.append("span")
		.text("*=");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "m")
		.attr("max", 1)
		.attr("min", 0.01)
		.attr("step", 0.01)
		.attr("value", 0.99)
		.on("change", () => {
			const m = +elm.select("[name=m]").property("value")
			kmns.method._m = m
		})
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (kmns._model.size == 0) {
				return;
			}
			kmns.step(fitPoints);
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Run")
		.on("click", function() {
			isRunning = !isRunning;
			d3.select(this).attr("value", (isRunning) ? "Stop" : "Run");
			stepButton.property("disabled", isRunning);
			if (isRunning) {
				kmns.startLoop(() => {
					kmns._datas = platform.datas
					fitPoints();
				});
			} else {
				kmns.stopLoop();
			}
		});
	return () => {
		isRunning = false;
		kmns.terminate();
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispNeuralGas(platform.setting.ml.configElement, platform)
}
