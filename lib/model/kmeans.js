/**
 * Bsae class for k-means like model
 */
class KMeansBase {
	constructor() {
		this._centroids = []
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
			v += (a[i] - b[i]) ** 2
		}
		return Math.sqrt(v)
	}

	/**
	 * Add a new cluster.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Added centroid
	 */
	add(datas) {
		const cpoint = this._add(this._centroids, datas)
		this._centroids.push(cpoint)
		return cpoint
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._centroids = []
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(datas) {
		if (this._centroids.length === 0) {
			return
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
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number} Total distance the centroid has moved
	 */
	fit(datas) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0
		}
		const oldCentroids = this._centroids
		this._centroids = this._move(this._centroids, datas)
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0)
		return d
	}
}

/**
 * k-means model
 */
export class KMeans extends KMeansBase {
	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	/**
	 * Returns a new centroid.
	 *
	 * @param {Array<Array<number>>} centroids Centroids
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Added centroid
	 */
	_add(centroids, datas) {
		while (true) {
			const p = datas[Math.floor(Math.random() * datas.length)]
			if (
				Math.min.apply(
					null,
					centroids.map(c => this._distance(p, c))
				) > 1.0e-8
			) {
				return p.concat()
			}
		}
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n)
	}

	/**
	 * Returns moved centroid positions.
	 *
	 * @param {Array<Array<number>>} centroids Centroids
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {Array<Array<number>>} Moved centroids
	 */
	_move(centroids, datas) {
		let pred = this.predict(datas)
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k)
			return this._mean(catpoints)
		})
	}
}

/**
 * k-means++ model
 */
export class KMeanspp extends KMeans {
	/**
	 * Returns a new centroid.
	 *
	 * @param {Array<Array<number>>} centroids Centroids
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {number[]} Added centroid
	 */
	_add(centroids, datas) {
		if (centroids.length === 0) {
			return datas[Math.floor(Math.random() * datas.length)]
		}
		const d = datas.map(
			d =>
				Math.min.apply(
					null,
					centroids.map(c => this._distance(d, c))
				) ** 2
		)
		const s = d.reduce((acc, v) => acc + v, 0)
		let r = Math.random() * s
		for (var i = 0; i < d.length; i++) {
			if (r < d[i]) {
				return datas[i]
			}
			r -= d[i]
		}
	}
}

/**
 * k-medoids model
 */
export class KMedoids extends KMeans {
	/**
	 * Returns moved centroid positions.
	 *
	 * @param {Array<Array<number>>} centroids Centroids
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {Array<Array<number>>} Moved centroids
	 */
	_move(centroids, datas) {
		let pred = this.predict(datas)
		return centroids.map((c, k) => {
			let catpoints = datas.filter((v, i) => pred[i] === k)
			if (catpoints.length > 0) {
				let mind = Infinity
				let mini = -1
				for (let i = 0; i < catpoints.length; i++) {
					let d = 0
					for (let j = 0; j < catpoints.length; j++) {
						d += this._distance(catpoints[i], catpoints[j])
					}
					if (d < mind) {
						mind = d
						mini = i
					}
				}
				return catpoints[mini]
			} else {
				return c
			}
		})
	}
}

/**
 * k-medians model
 */
export class KMedians extends KMeans {
	// https://en.wikipedia.org/wiki/K-medians_clustering
	/**
	 * Returns moved centroid positions.
	 *
	 * @param {Array<Array<number>>} centroids Centroids
	 * @param {Array<Array<number>>} datas Training data
	 * @returns {Array<Array<number>>} Moved centroids
	 */
	_move(centroids, datas) {
		const pred = this.predict(datas)
		return centroids.map((c, k) => {
			const catpoints = datas.filter((v, i) => pred[i] === k)
			const dlen = catpoints.length
			if (catpoints.length > 0) {
				const cp = []
				for (let i = 0; i < c.length; i++) {
					const di = catpoints.map(v => v[i])
					di.sort((a, b) => a - b)
					if (dlen % 2 === 0) {
						cp.push((di[dlen / 2] + di[dlen / 2 - 1]) / 2)
					} else {
						cp.push(di[(dlen - 1) / 2])
					}
				}
				return cp
			} else {
				return c
			}
		})
	}
}

/**
 * semi-supervised k-means model
 */
export class SemiSupervisedKMeansModel extends KMeansBase {
	// https://arxiv.org/abs/1307.0252
	constructor() {
		super()
	}

	/**
	 * Categories
	 *
	 * @type {*[]}
	 */
	get categories() {
		return this._classes
	}

	_mean(d) {
		const n = d.length
		const t = d[0].length
		const m = Array(t).fill(0)
		for (let i = 0; i < n; i++) {
			for (let k = 0; k < t; k++) {
				m[k] += d[i][k]
			}
		}
		return m.map(v => v / n)
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @param {(* | null)[]} labels Target values
	 */
	init(datas, labels) {
		this.clear()
		this._classes = [...new Set(labels.filter(v => v != null))]
		for (let k = 0; k < this._classes.length; k++) {
			const labeledDatas = datas.filter((v, i) => labels[i] === this._classes[k])
			this._centroids.push(this._mean(labeledDatas))
		}
	}

	add() {}

	/**
	 * Fit and returns total distance the centroid has moved.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 * @param {(* | null)[]} labels Target values
	 * @returns {number} Total distance the centroid has moved
	 */
	fit(datas, labels) {
		if (this._centroids.length === 0 || datas.length === 0) {
			return 0
		}
		const oldCentroids = this._centroids
		const pred = this.predict(datas)
		for (let i = 0; i < labels.length; i++) {
			const cidx = this._classes.indexOf(labels[i])
			if (cidx >= 0) {
				pred[i] = cidx
			}
		}
		this._centroids = this._centroids.map((c, k) => {
			const catpoints = datas.filter((v, i) => pred[i] === this._classes[k])
			return this._mean(catpoints)
		})
		const d = oldCentroids.reduce((s, c, i) => s + this._distance(c, this._centroids[i]), 0)
		return d
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(datas) {
		if (this._centroids.length === 0) {
			return
		}
		return super.predict(datas).map(v => this._classes[v])
	}
}
