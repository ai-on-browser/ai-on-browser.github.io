const metrics = {
	euclid: () => (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: () => (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: () => (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
	minkowski:
		({ p = 2 } = {}) =>
		(a, b) =>
			Math.pow(
				a.reduce((s, v, i) => s + (v - b[i]) ** p, 0),
				1 / p
			),
}

/**
 * Nearest centroid classifier
 */
export default class NearestCentroid {
	// https://scikit-learn.org/stable/modules/neighbors.html#nearest-centroid-classifier
	/**
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 */
	constructor(metric = 'euclid') {
		this._c = []

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]()
		}
	}

	/**
	 * Add a data.
	 * @param {number[]} point Training data
	 * @param {*} category Target value
	 */
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
			center: point.concat(),
		})
	}

	/**
	 * Add datas.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {*[]} targets Target values
	 */
	fit(datas, targets) {
		datas.forEach((d, i) => this.add(d, targets[i]))
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		return datas.map(data => {
			let min_d = Infinity
			let min_cat = null
			this._c.forEach(c => {
				const d = this._d(c.center, data)
				if (d < min_d) {
					min_d = d
					min_cat = c.category
				}
			})
			return min_cat
		})
	}
}
