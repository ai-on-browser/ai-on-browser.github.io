import { KMeansModel, KMeansModelPlotterBase } from './kmeans.js'

class LBG {
	// http://www.spcom.ecei.tohoku.ac.jp/~aito/patternrec/slides3.pdf
	// https://seesaawiki.jp/a-i/d/Linde-Buzo-Gray%20algorithm
	constructor() {
		this._centroids = []
	}

	get centroids() {
		return this._centroids
	}

	get size() {
		return this._centroids.length;
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0));
	}

	clear() {
		this._centroids = [];
	}

	fit(datas, iterations = -1) {
		if (this._centroids.length === 0) {
			const kmeans = new KMeansModel()
			kmeans.add(datas)
			while (kmeans.fit(datas) > 0)
			this._centroids = kmeans.centroids
			return
		}

		const new_centroids = []
		const e = Matrix.fromArray(datas).mean(0).copyDiv(100).value
		for (const c of this._centroids) {
			const cp = c.concat()
			const cn = c.concat()
			for (let i = 0; i < e.length; i++) {
				cp[i] += e[i]
				cn[i] -= e[i]
			}
			new_centroids.push(cp, cn)
		}

		const kmeans = new KMeansModel()
		kmeans._centroids = new_centroids
		while (kmeans.fit(datas) > 0)
		this._centroids = kmeans.centroids
	}

	predict(datas) {
		if (this._centroids.length == 0) {
			return
		}
		return datas.map(value => {
			return argmin(this._centroids, v => this._distance(value, v))
		})
	}
}

class LBGPlotter extends KMeansModelPlotterBase {
	constructor(r, datas) {
		super(r, datas)
		this._model = new LBG();
	}
}

var dispLBG = function(elm, platform) {
	const svg = platform.svg;

	const kmns = new LBGPlotter(svg, platform.datas);
	let isRunning = false;

	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			kmns.fit();
			kmns.categorizePoints();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			kmns.clearCentroids();
			elm.select("[name=clusternumber]")
				.text(kmns._model.size + " clusters");
		});
	return () => {
		isRunning = false;
		kmns.terminate();
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Step" button repeatedly.'
	platform.setting.terminate = dispLBG(platform.setting.ml.configElement, platform);
}
