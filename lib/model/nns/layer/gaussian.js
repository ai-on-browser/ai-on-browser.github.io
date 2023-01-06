import Layer from './base.js'

/**
 * Gaussian layer
 */
export default class GaussianLayer extends Layer {
	calc(x) {
		this._i = x
		this._o = x.copy()
		this._o.map(v => Math.exp((-v * v) / 2))
		return this._o
	}

	grad(bo) {
		const bi = this._o.copy()
		bi.broadcastOperate(this._i, (a, b) => -a * b)
		bi.broadcastOperate(bo, (a, b) => a * b)
		return bi
	}
}

GaussianLayer.registLayer()
