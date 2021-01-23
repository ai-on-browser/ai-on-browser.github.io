class NearestCentroid {
	// https://scikit-learn.org/stable/modules/neighbors.html#nearest-centroid-classifier
	constructor(metric = 'euclid') {
		this._c = [];

		this._metric = metric
		switch (this._metric) {
		case 'euclid':
			this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
			break
		case 'manhattan':
			this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
			break
		case 'chebyshev':
			this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
			break;
		case 'minkowski':
			this._dp = 2;
			this._d = (a, b) => Math.pow(a.reduce((s, v, i) => s * (v - b[i]) ** this._dp, 0), 1 / this._dp)
			break;
		}
	}

	add(point, category) {
		for (let i = 0; i < this._c.length; i++) {
			if (this._c[i].category === category) {
				const n = ++this._c[i].n
				for (let d = 0; d < this._c[i].point.length; d++) {
					this._c[i].point[d] += point[d]
					this._c[i].center[d] = this._c[i].point[d] / n
				}
				return
			}
		}
		this._c.push({
			n: 1,
			category: category,
			point: point.concat(),
			center: point.concat()
		})
	}

	fit(datas, targets) {
		datas.forEach((d, i) => this.add(d, targets[i]))
	}

	predict(datas) {
		return datas.map(data => {
			let min_d = Infinity;
			let min_cat = null
			this._c.forEach(c => {
				const d = this._d(c.center, data)
				if (d < min_d) {
					min_d = d
					min_cat = c.category
				}
			})
			return min_cat;
		})
	}
}

var dispNearestCentroid = function(elm, platform) {
	const calcNearestCentroid = function() {
		const metric = elm.select("[name=metric]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			let model = new NearestCentroid(metric);
			model.fit(tx, ty.map(v => v[0]))
			const pred = model.predict(px)
			pred_cb(pred)
		}, 4)
	}

	elm.append("select")
		.attr("name", "metric")
		.selectAll("option")
		.data([
			"euclid",
			"manhattan",
			"chebyshev"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcNearestCentroid);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispNearestCentroid(platform.setting.ml.configElement, platform)
}
