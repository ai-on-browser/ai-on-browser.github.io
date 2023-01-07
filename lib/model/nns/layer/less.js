import Layer from './base.js'

/**
 * Less layer
 */
export default class LessLayer extends Layer {
	calc(...x) {
		this._i = x
		this._o = x[0].copy()
		this._o.map((v, i) => v < x[1].at(i))
		return this._o
	}

	// grad() {}
}

LessLayer.registLayer()
