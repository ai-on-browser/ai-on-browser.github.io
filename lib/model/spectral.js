import { KMeanspp } from './kmeans.js'
import LaplacianEigenmaps from './laplacian_eigenmaps.js'

/**
 * Spectral clustering
 */
export default class SpectralClustering {
	// https://mr-r-i-c-e.hatenadiary.org/entry/20121214/1355499195
	/**
	 * @param {'rbf' | 'knn'} [affinity=rbf] Affinity type name
	 * @param {object} [param={}] Config
	 * @param {number} [param.sigma=1.0] Sigma of normal distribution
	 * @param {number} [param.k=10] Number of neighborhoods
	 */
	constructor(affinity = 'rbf', param = {}) {
		this._size = 0
		this._epoch = 0
		this._clustering = new KMeanspp()
		this._affinity = affinity
		this._sigma = param.sigma || 1.0
		this._k = param.k || 10
	}

	/**
	 * Number of clusters.
	 *
	 * @type {number}
	 */
	get size() {
		return this._size
	}

	/**
	 * Epoch.
	 *
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	/**
	 * Initialize model.
	 *
	 * @param {Array<Array<number>>} datas Training data
	 */
	init(datas) {
		const n = datas.length
		this._n = n
		const le = new LaplacianEigenmaps(datas[0].length, this._affinity, this._k, this._sigma, 'normalized')
		this.ready = false
		le.predict(datas)
		this._ev = le._ev
		this._ev.flip(1)
	}

	/**
	 * Add a new cluster.
	 */
	add() {
		this._size++
		this._clustering.clear()
		const s_ev = this._ev.slice(this._n - this._size, this._n, 1)
		this._s_ev = s_ev.toArray()
		for (let i = 0; i < this._size; i++) {
			this._clustering.add(this._s_ev)
		}
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._size = 0
		this._epoch = 0
		this._clustering.clear()
	}

	/**
	 * Returns predicted categories.
	 *
	 * @returns {number[]} Predicted values
	 */
	predict() {
		return this._clustering.predict(this._s_ev)
	}

	/**
	 * Fit and returns total distance the centroid has moved.
	 *
	 * @returns {number} Total distance the centroid has moved
	 */
	fit() {
		this._epoch++
		return this._clustering.fit(this._s_ev)
	}
}
