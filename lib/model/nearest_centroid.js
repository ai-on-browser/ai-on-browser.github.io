/**
 * Nearest centroid classifier
 */
export default class NearestCentroid {
	// https://scikit-learn.org/stable/modules/neighbors.html#nearest-centroid-classifier
	/**
	 * @param {'euclid' | 'manhattan' | 'chebyshev' | 'minkowski'} metric
	 */
	constructor(metric = 'euclid') {
		this._c = []

		this._metric = metric
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
						a.reduce((s, v, i) => s * (v - b[i]) ** this._dp, 0),
						1 / this._dp
					)
				break
		}
	}

	/**
	 * Add a data.
	 *
	 * @param {number[]} point
	 * @param {*} category
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
	 *
	 * @param {Array<Array<number>>} datas
	 * @param {*[]} targets
	 */
	fit(datas, targets) {
		datas.forEach((d, i) => this.add(d, targets[i]))
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas
	 * @returns {*[]}
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
