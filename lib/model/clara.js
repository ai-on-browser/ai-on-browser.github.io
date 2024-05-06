import PAM from './pam.js'

/**
 * Clustering LARge Applications
 */
export default class CLARA {
	// http://ibisforest.org/index.php?CLARANS
	/**
	 * @param {number} k Number of clusters
	 */
	constructor(k) {
		this._k = k
		this._sample_size = 40 + 2 * k
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

	_sample_idx(n, k) {
		k = Math.min(n, k)
		const idx = []
		for (let i = 0; i < k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = k - 1; i >= 0; i--) {
			for (let j = k - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		return idx
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		this._x = datas
		this._centroids = this._sample_idx(this._x.length, this._k)
	}

	/**
	 * Fit model.
	 */
	fit() {
		const pam = new PAM(this._k)
		const sample = this._sample_idx(this._x.length, this._sample_size)
		pam.init(sample.map(i => this._x[i]))
		while (!pam.fit());
		const cur_cost = this._cost(this._centroids)
		const new_centroids = pam._centroids.map(i => sample[i])
		const new_cost = this._cost(new_centroids)
		if (new_cost < cur_cost) {
			this._centroids = new_centroids
		}
	}

	/**
	 * Returns predicted categories.
	 * @returns {number[]} Predicted values
	 */
	predict() {
		const c = this._centroids.map(v => this._x[v])
		return this._x.map(x => {
			return this._argmin(c.map(v => this._distance(x, v)))
		})
	}
}
