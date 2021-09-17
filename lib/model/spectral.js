import { Matrix } from '../util/math.js'

import { KMeansModel, KMeanspp } from './kmeans.js'
import { LaplacianEigenmaps } from './laplacian_eigenmaps.js'

export default class SpectralClustering {
	// https://mr-r-i-c-e.hatenadiary.org/entry/20121214/1355499195
	constructor(affinity = 'rbf', param = {}) {
		this._size = 0
		this._epoch = 0
		this._clustering = new KMeansModel()
		this._clustering.method = new KMeanspp()
		this._affinity = affinity
		this._sigma = param.sigma || 1.0
		this._k = param.k || 10
	}

	get size() {
		return this._size
	}

	get epoch() {
		return this._epoch
	}

	init(datas) {
		const n = datas.length
		this._n = n
		const le = new LaplacianEigenmaps(this._affinity, this._k, this._sigma, 'normalized')
		this.ready = false
		le.predict(Matrix.fromArray(datas), 0)
		this._ev = le._ev
		this._ev.flip(1)
	}

	add() {
		this._size++
		this._clustering.clear()
		const s_ev = this._ev.sliceCol(this._n - this._size, this._n)
		this._s_ev = s_ev.toArray()
		for (let i = 0; i < this._size; i++) {
			this._clustering.add(this._s_ev)
		}
	}

	clear() {
		this._size = 0
		this._epoch = 0
		this._clustering.clear()
	}

	predict() {
		return this._clustering.predict(this._s_ev)
	}

	fit() {
		this._epoch++
		return this._clustering.fit(this._s_ev)
	}
}
