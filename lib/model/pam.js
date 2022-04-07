/**
 * Partitioning Around Medoids
 */
export default class PAM {
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

	_argmin(arr) {
		let min_v = Infinity
		let min_i = -1
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] < min_v) {
				min_v = arr[i]
				min_i = i
			}
		}
		return min_i
	}

	_cost(centroids) {
		const c = centroids.map(v => this._x[v])
		const n = this._x.length
		let cost = 0
		for (let i = 0; i < n; i++) {
			const category = this._argmin(c.map(v => this._distance(this._x[i], v)))
			cost += this._distance(this._x[i], c[category])
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
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (this._x.length - i)))
		}
		for (let i = this._k - 1; i >= 0; i--) {
			for (let j = this._k - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._centroids = idx
	}

	/**
	 * Fit model and returns true if any centroids has moved.
	 *
	 * @returns {boolean} `true` if any centroids has moved
	 */
	fit() {
		const n = this._x.length
		let init_cost = this._cost(this._centroids)
		let changed = false
		for (let k = 0; k < this._k; k++) {
			let min_cost = Infinity
			let min_idx = -1
			for (let i = 0; i < n; i++) {
				if (this._centroids.some(c => c === i)) {
					continue
				}
				const new_c = this._centroids.concat()
				new_c[k] = i
				const new_cost = this._cost(new_c)
				if (new_cost < min_cost) {
					min_cost = new_cost
					min_idx = i
				}
			}
			if (min_cost < init_cost) {
				this._centroids[k] = min_idx
				init_cost = min_cost
				changed = true
			}
		}
		return changed
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const c = this._centroids.map(v => this._x[v])
		return this._x.map(x => {
			return this._argmin(c.map(v => this._distance(x, v)))
		})
	}
}
