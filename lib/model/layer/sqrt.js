import Layer from './base.js'

export default class SqrtLayer extends Layer {
	calc(x) {
		this._i = x
		this._o = x.copyMap(Math.sqrt)
		return this._o
	}

	grad(bo) {
		const bi = this._o.copyMap(v => 1 / (2 * v))
		bi.mult(bo)
		return bi
	}
}

SqrtLayer.registLayer()
