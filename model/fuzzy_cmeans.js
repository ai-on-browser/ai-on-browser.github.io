import { KMeans, KMeansModelPlotter } from './kmeans.js'

class FuzzyCMeans extends KMeans {
	// http://ibisforest.org/index.php?%E3%83%95%E3%82%A1%E3%82%B8%E3%82%A3c-means%E6%B3%95
	constructor(m = 2) {
		super()
		this._m = m
		this._u = []
	}

	add(centroids, datas) {
		const u = []
		for (let i = 0; i < datas.length; i++) {
			u.push(Math.random())
		}
		this._u.push(u)
		return super.add(centroids, datas)
	}

	move(model, centroids, datas) {
		const m = datas[0].length
		const c = this._u.map(u => {
			const c = Array(m).fill(0)
			let s = 0
			for (let i = 0; i < datas.length; i++) {
				s += u[i] ** this._m
				for (let d = 0; d < m; d++) {
					c[d] += datas[i][d] * u[i] ** this._m
				}
			}
			return c.map(v => v / s)
		})
		for (let i = 0; i < datas.length; i++) {
			const d = c.map(c => datas[i].reduce((s, v, j) => s + (v - c[j]) ** 2, 0))
			for (let k = 0; k < c.length; k++) {
				let v = 0
				for (let j = 0; j < c.length; j++) {
					v += (d[k] / d[j]) ** (1 / (this._m - 1))
				}
				this._u[k][i] = 1 / v
			}
		}
		return c
	}
}

var dispFuzzyCMeans = function(elm, platform) {
	const svg = platform.svg;

	const kmns = new KMeansModelPlotter(svg, platform.datas);
	kmns.method = new FuzzyCMeans();
	kmns._duration = 100
	let isRunning = false;

	const fitPoints = () => {
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const pred = kmns._model.predict(px);
				pred_cb([], pred.map(v => v + 1))
			}, 4, 1
		);
	}

	elm.append("span")
		.text("m");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "m")
		.attr("max", 10)
		.attr("min", 2)
		.attr("value", 2)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			kmns.clearCentroids();
			const m = +elm.select("[name=m]").property("value")
			kmns.method = new FuzzyCMeans(m);
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
	platform.setting.terminate = dispFuzzyCMeans(platform.setting.ml.configElement, platform)
}
