import { KMeans, KMeansModel } from './kmeans.js'

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
	const model = new KMeansModel();
	model.method = new NeuralGas();

	const fitPoints = () => {
		platform.predict(
			(px, pred_cb) => {
				const pred = model.predict(px);
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=l]").property("value", model.method._l)
			}, 4
		);
	}

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		const l = +elm.select("[name=l]").property("value")
		const m = +elm.select("[name=m]").property("value")
		model.method = new NeuralGas(l, m);
		elm.select("[name=clusternumber]")
			.text(model.size + " clusters");
		platform.init()
	})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Add centroid")
		.on("click", () => {
			model.add(platform.datas.x)
			platform.fit((tx, ty, pred_cb) => {
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {line: true})
			fitPoints()
			elm.select("[name=clusternumber]")
				.text(model.size + " clusters");
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
			model.method._l = l
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
			model.method._m = m
		})
	slbConf.step(cb => {
		if (model.size == 0) {
			cb && cb()
			return
		}
		platform.fit((tx, ty, pred_cb) => {
			model.fit(tx)
			const pred = model.predict(platform.datas.x)
			pred_cb(pred.map(v => v + 1))
		})
		platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {
			line: true,
			duration: 100
		})
		fitPoints()
		cb && setTimeout(cb, 100)
	})
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	platform.setting.terminate = dispNeuralGas(platform.setting.ml.configElement, platform)
}
