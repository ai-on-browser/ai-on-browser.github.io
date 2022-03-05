import Matrix from '../util/matrix.js'

import { KMeans } from './kmeans.js'

const argmin = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.min(...arr))
}

const cvTable = [
	[0.514, 0.578, 0.683, 0.779, 0.926],
	[0.528, 0.591, 0.704, 0.815, 0.969],
	[0.546, 0.616, 0.735, 0.861, 1.021],
	[0.559, 0.631, 0.754, 0.884, 1.047],
	[0.576, 0.656, 0.787, 0.918, 1.092],
]

const AndersonDarling = (data, p) => {
	// https://en.wikipedia.org/wiki/Anderson%E2%80%93Darling_test
	data.sort((a, b) => a - b)
	const n = data.length
	const mean = data.reduce((s, v) => s + v, 0) / n
	const vari = data.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1)
	const std = Math.sqrt(vari)

	const z = data.map(v => (v - mean) / std)
	const zcdf = z.map(v => 1 / (1 + Math.exp(-1.7 * v)))
	let s = 0
	for (let i = 0; i < n; i++) {
		s += (2 * (i + 1) - 1) * (Math.log(zcdf[i]) + Math.log(1 - zcdf[n - i - 1]))
	}

	const a2 = -n - s / n
	const as2 = a2 * (1 + 4 / n - 25 / n ** 2)

	const cv =
		cvTable[n <= 10 ? 0 : n <= 20 ? 1 : n <= 50 ? 2 : n <= 100 ? 3 : 4][
			p === 15 ? 0 : p === 10 ? 1 : p === 5 ? 2 : p === 2.5 ? 3 : p === 1 ? 4 : -1
		]
	return as2 <= cv
}

/**
 * G-means
 */
export default class GMeans {
	// https://qiita.com/nagomiso/items/fae8a63e06d7c03c7ded
	constructor() {
		this._centroids = []
		this._init_k = 2
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
	 *
	 * @param {Array<Array<number>>} datas
	 * @param {number} iterations
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

				const x = Matrix.fromArray(c.data)
				const [ev, m] = x.cov().eigenPowerIteration()
				m.mult(Math.sqrt((2 * ev) / Math.PI))
				const v = Matrix.mult(m, 2)
				const xd = x.dot(v)
				xd.div(v.norm())
				const test = AndersonDarling(xd.value, 5)

				if (test) {
					centers.push(c.centroid)
				} else {
					const [c1, c2] = this._split_cluster(c.data)
					new_clusters.push(c1, c2)
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
		const kmeans = new KMeans()
		for (let i = 0; i < k; i++) {
			kmeans.add(datas)
		}
		while (kmeans.fit(datas) > 0);
		return this._create_clusters(kmeans, datas)
	}

	_create_clusters(model, datas) {
		const k = model.size
		const p = model.predict(datas)
		const ds = []
		for (let i = 0; i < k; ds[i++] = []);
		datas.forEach((d, i) => ds[p[i]].push(d))
		const clusters = []
		for (let i = 0; i < k; i++) {
			clusters[i] = {
				size: ds[i].length,
				data: ds[i],
				centroid: model.centroids[i],
			}
		}
		return clusters
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} datas
	 * @returns {number[]}
	 */
	predict(datas) {
		if (this._centroids.length === 0) {
			return
		}
		return datas.map(value => {
			return argmin(this._centroids, v => this._distance(value, v))
		})
	}
}
