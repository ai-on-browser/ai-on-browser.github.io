import Matrix from '../util/matrix.js'

class KMeans {
	constructor(x, k) {
		this._x = x
		this._k = k

		const n = this._x.length
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._c = idx.map(v => this._x[v])

		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	get centroids() {
		return this._c
	}

	fit() {
		const p = this.predict()

		const c = this._c.map(p => Array.from(p, () => 0))
		const count = Array(this._k).fill(0)
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this._x[i].length; j++) {
				c[p[i]][j] += this._x[i][j]
			}
			count[p[i]]++
		}
		let d = 0
		for (let k = 0; k < this._k; k++) {
			const mc = c[k].map(v => v / count[k])
			d += this._c[k].reduce((s, v, j) => s + (v - mc[j]) ** 2, 0)
			this._c[k] = c[k].map(v => v / count[k])
		}
		return d
	}

	predict() {
		const p = []
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			p[i] = -1
			for (let k = 0; k < this._k; k++) {
				const d = this._d(this._x[i], this._c[k])
				if (d < min_d) {
					min_d = d
					p[i] = k
				}
			}
		}
		return p
	}
}

/**
 * x-means
 */
export default class XMeans {
	// https://qiita.com/deaikei/items/8615362d320c76e2ce0b
	// https://www.jstage.jst.go.jp/article/jappstat1971/29/3/29_3_141/_pdf
	constructor() {
		this._centroids = []
		this._init_k = 2
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
		return Math.sqrt(a.reduce((acc, v, i) => acc + (v - b[i]) ** 2, 0))
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._centroids = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas Training data
	 * @param {number} iterations Iteration count
	 */
	fit(datas, iterations = -1) {
		let clusters = null
		if (this._centroids.length === 0) {
			clusters = this._split_cluster(datas, this._init_k)
			iterations--
		} else {
			clusters = this._create_clusters(this, datas)
		}
		const centers = []

		while (clusters.length > 0 && (iterations < 0 || iterations-- > 0)) {
			const new_clusters = []
			while (clusters.length > 0) {
				const c = clusters.shift()
				if (c.size <= 3) {
					centers.push(c.centroid)
					continue
				}
				const [c1, c2] = this._split_cluster(c.data)
				const beta = Math.sqrt(
					c1.centroid.reduce((s, v, i) => s + (v - c2.centroid[i]) ** 2, 0) / (c1.cov.det() + c2.cov.det())
				)
				// http://marui.hatenablog.com/entry/20110516/1305520406
				const norm_cdf = 1 / (1 + Math.exp(-1.7 * beta))
				const alpha = 0.5 / norm_cdf

				const df = (c.cols * (c.cols + 3)) / 2
				const bic = -2 * (c.size * Math.log(alpha) + c1.llh + c2.llh) + 2 * df * Math.log(c.size)

				if (bic < c.bic) {
					new_clusters.push(c1, c2)
				} else {
					centers.push(c.centroid)
				}
			}
			clusters = new_clusters
		}
		if (clusters.length > 0) {
			centers.push(...clusters.map(c => c.centroid))
		}
		this._centroids = centers
	}

	_split_cluster(datas, k = 2) {
		const kmeans = new KMeans(datas, k)
		while (kmeans.fit() > 0);
		return this._create_clusters(kmeans, datas)
	}

	_create_clusters(model, datas) {
		const k = model.centroids.length
		const p = model.predict(datas)
		const ds = []
		for (let i = 0; i < k; ds[i++] = []);
		datas.forEach((d, i) => ds[p[i]].push(d))
		const clusters = []
		for (let i = 0; i < k; i++) {
			const mat = Matrix.fromArray(ds[i])
			const cov = mat.cov()
			const invcov = cov.inv()
			const mean = mat.mean(0)
			const cc = Math.log(1 / Math.sqrt((2 * Math.PI) ** mat.cols * cov.det()))
			let llh = cc * mat.rows
			for (let j = 0; j < mat.rows; j++) {
				const r = mat.row(j)
				r.sub(mean)
				llh -= r.dot(invcov).dot(r.t).toScaler() / 2
			}
			const df = (mat.cols * (mat.cols + 3)) / 2
			clusters[i] = {
				size: ds[i].length,
				cols: mat.cols,
				data: ds[i],
				cov: cov,
				centroid: model.centroids[i],
				llh: llh,
				bic: -2 * llh + df * Math.log(ds[i].length),
			}
		}
		return clusters
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
}
