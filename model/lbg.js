import { KMeansModel } from './kmeans.js'

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
		const x = Matrix.fromArray(datas)
		if (this._centroids.length === 0) {
			this._centroids = x.mean(0).toArray()
			return
		}

		const new_centroids = []
		const e = x.max(0).copySub(x.min()).copyDiv(100).value
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

var dispLBG = function(elm, platform) {
	const model = new LBG();

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Step")
		.on("click", () => {
			platform.fit((tx, ty, pred_cb) => {
				model.fit(tx)
				const pred = model.predict(platform.datas.x)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(model.centroids, model.centroids.map((c, i) => i + 1), {
				line: true
			})
			elm.select("[name=clusternumber]")
				.text(model.size + " clusters");
		});
	elm.append("span")
		.attr("name", "clusternumber")
		.style("padding", "0 10px")
		.text("0 clusters");
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Clear centroid")
		.on("click", () => {
			model.clear()
			platform.init()
			elm.select("[name=clusternumber]")
				.text(model.size + " clusters");
		});
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispLBG(platform.setting.ml.configElement, platform);
}
