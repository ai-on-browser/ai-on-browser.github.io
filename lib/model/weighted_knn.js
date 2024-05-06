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
			switch (this._metric) {
				case 'euclid':
					this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
					break
				case 'manhattan':
					this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
					break
				case 'chebyshev':
					this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
					break
				case 'minkowski':
					this._dp = 2
					this._d = (a, b) =>
						Math.pow(
							a.reduce((s, v, i) => s + (v - b[i]) ** this._dp, 0),
							1 / this._dp
						)
					break
			}
		}

		this._weight = weight
		switch (this._weight) {
			case 'gaussian':
				this._w = d => Math.exp(-(d ** 2) / 2)
				break
			case 'rectangular':
				this._w = d => (Math.abs(d) > 1 ? 0 : 0.5)
				break
			case 'triangular':
				this._w = d => (Math.abs(d) > 1 ? 0 : 1 - Math.abs(d))
				break
			case 'epanechnikov':
				this._w = d => (Math.abs(d) > 1 ? 0 : (3 / 4) * (1 - d ** 2))
				break
			case 'quartic':
				this._w = d => (Math.abs(d) > 1 ? 0 : (15 / 16) * (1 - d ** 2) ** 2)
				break
			case 'triweight':
				this._w = d => (Math.abs(d) > 1 ? 0 : (35 / 32) * (1 - d ** 2) ** 3)
				break
			case 'cosine':
				this._w = d => (Math.abs(d) > 1 ? 0 : (Math.PI / 4) * Math.cos((Math.PI / 2) * d))
				break
			case 'inversion':
				this._w = d => 1 / Math.abs(d)
				break
		}
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
