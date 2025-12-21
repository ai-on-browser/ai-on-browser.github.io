const metrics = {
	euclid: () => (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)),
	manhattan: () => (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0),
	chebyshev: () => (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i]))),
	minkowski:
		({ p = 2 } = {}) =>
		(a, b) =>
			a.reduce((s, v, i) => s + (v - b[i]) ** p, 0) ** (1 / p),
}

const weights = {
	gaussian: d => Math.exp(-(d ** 2) / 2),
	rectangular: d => (Math.abs(d) > 1 ? 0 : 0.5),
	triangular: d => (Math.abs(d) > 1 ? 0 : 1 - Math.abs(d)),
	epanechnikov: d => (Math.abs(d) > 1 ? 0 : (3 / 4) * (1 - d ** 2)),
	quartic: d => (Math.abs(d) > 1 ? 0 : (15 / 16) * (1 - d ** 2) ** 2),
	triweight: d => (Math.abs(d) > 1 ? 0 : (35 / 32) * (1 - d ** 2) ** 3),
	cosine: d => (Math.abs(d) > 1 ? 0 : (Math.PI / 4) * Math.cos((Math.PI / 2) * d)),
	inversion: d => 1 / Math.abs(d),
}

/**
 *  Weighted K-Nearest Neighbor
 */
export default class WeightedKNN {
	// https://epub.ub.uni-muenchen.de/1769/1/paper_399.pdf
	/**
	 * @param {number} k Number of neighbors
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski' | function (number[], number[]): number} [metric] Metric name
	 * @param {'gaussian' | 'rectangular' | 'triangular' | 'epanechnikov' | 'quartic' | 'triweight' | 'cosine' | 'inversion'} [weight] Weighting scheme name
	 */
	constructor(k, metric = 'euclid', weight = 'gaussian') {
		this._k = k

		this._metric = metric
		if (typeof this._metric === 'function') {
			this._d = this._metric
		} else {
			this._d = metrics[this._metric]()
		}

		this._weight = weight
		this._w = weights[this._weight]
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	fit(x, y) {
		this._x = x
		this._y = y
		this._c = [...new Set(y)]
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		return data.map(v => {
			const d = this._x.map((x, i) => ({ i, d: this._d(v, x) }))
			d.sort((a, b) => a.d - b.d)
			const dbase = d[this._k].d

			const clss = {}
			for (let k = 0; k < this._k && k < d.length; k++) {
				const i = d[k].i
				if (!clss[this._y[i]]) {
					clss[this._y[i]] = { category: this._y[i], w: this._w(d[k].d / dbase) }
				} else {
					clss[this._y[i]].w += this._w(d[k].d / dbase)
				}
			}
			let max_w = 0
			let target_cat = null
			for (const k of Object.keys(clss)) {
				if (max_w < clss[k].w) {
					max_w = clss[k].w
					target_cat = clss[k].category
				}
			}
			return target_cat
		})
	}
}
