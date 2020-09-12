import { KMeansModelPlotter } from './kmeans.js'

class NeuralGas {
	// https://en.wikipedia.org/wiki/Neural_gas
	constructor() {
		this._l = 1;
		this._eps = 1;
		this._epoch = 0;
		this._sample_rate = 0.8;
	}

	add(centroids, datas) {
		centroids = centroids.map(c => new DataVector(c));
		while (true) {
			const p = new DataVector(datas[randint(0, datas.length - 1)]);
			if (Math.min.apply(null, centroids.map(c => p.distance(c))) > 1.0e-8) {
				return p.value;
			}
		}
	}

	move(model, centroids, datas) {
		const x = datas.filter(v => Math.random() < this._sample_rate).map(v => new DataVector(v));
		this._epoch++;
		const cvec = centroids.map(c => new DataVector(c));
		const distances = x.map(v => {
			let ds = cvec.map((c, i) => [i, v.distance(c)])
			ds.sort((a, b) => a[1] - b[1]);
			ds = ds.map((d, k) => [d[0], d[1], k])
			ds.sort((a, b) => a[0] - b[0]);
			return ds;
		})
		return cvec.map((c, n) => {
			const updates = distances.map((v, i) => x[i].sub(c).mult(this._eps * Math.exp(-v[n][2] / this._l)))
			const update = updates.slice(1).reduce((acc, v) => acc.add(v), updates[0]).div(updates.length);
			return c.add(update).value;
		});
	}
}

var dispNeuralGas = function(elm, platform) {
	const svg = platform.svg;

	const kmns = new KMeansModelPlotter(svg, platform.datas);
	kmns.method = new NeuralGas();
	let isRunning = false;

	const fitPoints = () => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const pred = kmns._model.predict(px);
				pred_cb([], pred.map(v => v + 1))
			}, 4, 1
		);
	}

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", () => {
			kmns.addCentroid();
			kmns.categorizePoints();
			fitPoints();
			elm.select(".buttons [name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			if (kmns._model.size == 0) {
				return;
			}
			kmns.step(fitPoints);
		});
	elm.select(".buttons")
		.append("input")
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			kmns.clearCentroids();
			elm.select(".buttons [name=clusternumber]")
				.text(kmns._model.size + " clusters");
			platform.init()
		});
	return () => {
		isRunning = false;
		kmns.terminate();
	}
}


var neural_gas_init = function(platform) {
	const root = platform.setting.ml.configElement
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispNeuralGas(root, platform);

	setting.terminate = () => {
		termCallback();
	};
}

export default neural_gas_init
