/**
 * Weighted k-means model
 */
export default class WeightedKMeans {
	// http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.715.8143&rep=rep1&type=pdf#page=124
	// https://www.ijert.org/research/a-comparative-study-of-k-means-and-weighted-k-means-for-clustering-IJERTV1IS10227.pdf
	/**
	 * @param {number} beta Tuning parameter
	 */
	constructor(beta) {
		this._beta = beta
		this._centroids = []
		this._w = null
	}

	/**
	 * Centroids
	 *
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._centroids
	}

	/**
	 * Number of clusters.
	 *
	 * @type {number}
	 */
	get size() {
		return this._centroids.length
	}

	_distance(a, b) {
		let v = 0
		for (let i = a.length - 1; i >= 0; i--) {
			v += this._w[i] ** this._beta * (a[i] - b[i]) ** 2
		}
		return v
	}

	/**
	 * Add a new cluster.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Added centroid
	 */
	add(datas) {
		if (!this._w) {
			this._w = Array(datas[0].length).fill(1 / datas[0].length)
		}
		while (true) {
			const p = datas[Math.floor(Math.random() * datas.length)]
			if (Math.min(...this._centroids.map(c => c.reduce((s, v, k) => s + (v - p[k]) ** 2, 0))) > 1.0e-8) {
				const cpoint = p.concat()
				this._centroids.push(cpoint)
				return cpoint
			}
		}
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._centroids = []
		this._w = null
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._centroids.length === 0) {
			throw new Error('Call fit before predict.')
		}
		return datas.map(value => {
			let min_d = Infinity
			let min_k = -1
			for (let i = 0; i < this._centroids.length; i++) {
				const d = this._distance(value, this._centroids[i])
				if (d < min_d) {
					min_d = d
					min_k = i
				}
			}
			return min_k
		})
	}

	/**
	 * Fit model and returns total distance the centroid has moved.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number} Total distance the centroid has moved
	 */
	fit(datas) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0
		}
		if (!this._w) {
			this._w = Array(datas[0].length).fill(1 / datas[0].length)
		}
		const oldCentroids = this._centroids

		const pred = this.predict(datas)
		this._centroids = this._centroids.map((c, k) => {
			const m = Array(datas[0].length).fill(0)
			let s = 0
			for (let i = 0; i < datas.length; i++) {
				if (pred[i] !== k) {
					continue
				}
				for (let j = 0; j < m.length; j++) {
					m[j] += datas[i][j]
				}
				s++
			}
			return m.map(v => v / s)
		})

		const newpred = this.predict(datas)
		const d = Array(this._w.length).fill(0)
		for (let i = 0; i < datas.length; i++) {
			for (let j = 0; j < d.length; j++) {
				d[j] += (datas[i][j] - this._centroids[newpred[i]][j]) ** 2
			}
		}
		for (let k = 0; k < d.length; k++) {
			let v = 0
			for (let j = 0; j < d.length; j++) {
				v += (d[k] / d[j]) ** (1 / (this._beta - 1))
			}
			this._w[k] = 1 / v
		}

		const err = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0)
		return err
	}
}
