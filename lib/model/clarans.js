/**
 * Clustering Large Applications based on RANdomized Search
 */
export default class CLARANS {
	// http://ibisforest.org/index.php?CLARANS
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0))
	}

	_cost(categories) {
		const n = this._x.length
		const centroids = []
		const count = []
		for (let i = 0; i < n; i++) {
			const cat = categories[i]
			if (!centroids[cat]) {
				centroids[cat] = this._x[i].concat()
				count[cat] = 1
			} else {
				for (let k = 0; k < this._x[i].length; k++) {
					centroids[cat][k] += this._x[i][k]
				}
				count[cat]++
			}
		}
		for (let i = 0; i < centroids.length; i++) {
			for (let k = 0; k < centroids[i].length; k++) {
				centroids[i][k] /= count[i]
			}
		}
		let cost = 0
		for (let i = 0; i < n; i++) {
			cost += this._distance(this._x[i], centroids[categories[i]])
		}
		return cost
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._categories = []
		for (let i = 0; i < this._x.length; i++) {
			this._categories[i] = Math.floor(Math.random() * this._k)
		}
	}

	/**
	 * Fit model once.
	 *
	 * @param {number} numlocal Iteration count for local
	 * @param {number} maxneighbor Iteration count for neighborhoods
	 */
	fit(numlocal, maxneighbor) {
		const n = this._x.length
		const categories = this._categories
		let i = 1
		let mincost = Infinity
		while (i <= numlocal) {
			let j = 1
			let cur_cost = this._cost(categories)
			while (j <= maxneighbor) {
				const swap = Math.floor(Math.random() * n)
				const cur_cat = categories[swap]
				const new_cat = Math.floor(Math.random() * (this._k - 1))
				categories[swap] = new_cat >= cur_cat ? new_cat + 1 : new_cat
				const new_cost = this._cost(categories)
				if (new_cost < cur_cost) {
					j = 1
					cur_cost = new_cost
					continue
				}
				j++
				categories[swap] = cur_cat
			}
			if (cur_cost < mincost) {
				mincost = cur_cost
			}
			i++
		}
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._categories
	}
}
