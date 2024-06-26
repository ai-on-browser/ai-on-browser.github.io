/**
 * Neural gas model
 */
export default class NeuralGas {
	// https://en.wikipedia.org/wiki/Neural_gas
	/**
	 * @param {number} [l] Neughborhood range
	 * @param {number} [m] Decreasing factor of `l`
	 */
	constructor(l = 1, m = 0.99) {
		this._l = l
		this._eps = 1
		this._epoch = 0
		this._sample_rate = 0.8
		this._m = m
		this._centroids = []
	}

	/**
	 * Centroids
	 * @type {Array<Array<number>>}
	 */
	get centroids() {
		return this._centroids
	}

	/**
	 * Number of clusters.
	 * @type {number}
	 */
	get size() {
		return this._centroids.length
	}

	_distance(a, b) {
		let v = 0
		for (let i = a.length - 1; i >= 0; i--) {
			v += (a[i] - b[i]) ** 2
		}
		return Math.sqrt(v)
	}

	/**
	 * Add a new cluster.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Added centroid
	 */
	add(datas) {
		while (true) {
			const p = datas[Math.floor(Math.random() * datas.length)]
			if (
				Math.min.apply(
					null,
					this._centroids.map(c => this._distance(p, c))
				) > 1.0e-8
			) {
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
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._centroids.length === 0) {
			throw new Error('Call fit before predict.')
		}
		return datas.map(value => {
			let mind = Infinity
			let mini = -1
			for (let i = 0; i < this._centroids.length; i++) {
				const d = this._distance(value, this._centroids[i])
				if (d < mind) {
					mind = d
					mini = i
				}
			}
			return mini
		})
	}

	/**
	 * Fit model and returns total distance the centroid has moved.
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number} Total distance the centroid has moved
	 */
	fit(datas) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0
		}
		const oldCentroids = this._centroids

		const x = datas.filter(() => Math.random() < this._sample_rate)
		this._epoch++
		const cvec = this._centroids
		const distances = x.map(v => {
			let ds = cvec.map((c, i) => [i, this._distance(v, c)])
			ds.sort((a, b) => a[1] - b[1])
			ds = ds.map((d, k) => [d[0], d[1], k])
			ds.sort((a, b) => a[0] - b[0])
			return ds
		})
		this._centroids = cvec.map((c, n) => {
			const update = Array(x[0].length).fill(0)
			for (let i = 0; i < x.length; i++) {
				for (let j = 0; j < x[i].length; j++) {
					update[j] += (x[i][j] - c[j]) * this._eps * Math.exp(-distances[i][n][2] / this._l)
				}
			}
			return update.map((v, i) => c[i] + v / x.length)
		})
		this._l *= this._m

		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0)
		return d
	}
}
