import Layer from './base.js'

export default class GaussianLayer extends Layer {
	calc(x) {
		this._i = x
		this._o = x.copyMap(v => Math.exp((-v * v) / 2))
		return this._o
	}

	grad(bo) {
		const bi = this._o.copyMult(this._i)
		bi.mult(-1)
		bi.mult(bo)
		return bi
	}
}

GaussianLayer.registLayer()
