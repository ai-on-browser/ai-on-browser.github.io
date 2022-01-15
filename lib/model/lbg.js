import { Matrix } from '../util/math.js'

import { KMeansModel } from './kmeans.js'

const argmin = function (arr, key) {
	if (arr.length === 0) {
		return -1
	}
	arr = key ? arr.map(key) : arr
	return arr.indexOf(Math.min(...arr))
}

/**
 * Linde-Buzo-Gray algorithm
 */
export default class LBG {
	// http://www.spcom.ecei.tohoku.ac.jp/~aito/patternrec/slides3.pdf
	// https://seesaawiki.jp/a-i/d/Linde-Buzo-Gray%20algorithm
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
	 */
	fit(datas) {
		const x = Matrix.fromArray(datas)
		if (this._centroids.length === 0) {
			this._centroids = x.mean(0).toArray()
			return
		}

		const new_centroids = []
		const e = x.max(0).copySub(x.min()).copyDiv(100).value
		for (const c of this._centroids) {
			const cp = c.concat()
			const cn = c.concat()
			for (let i = 0; i < e.length; i++) {
				cp[i] += e[i]
				cn[i] -= e[i]
			}
			new_centroids.push(cp, cn)
		}

		const kmeans = new KMeansModel()
		kmeans._centroids = new_centroids
		while (kmeans.fit(datas) > 0) this._centroids = kmeans.centroids
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
