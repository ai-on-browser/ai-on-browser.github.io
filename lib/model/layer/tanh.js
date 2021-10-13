import Layer from './base.js'

export default class TanhLayer extends Layer {
	calc(x) {
		this._o = x.copyMap(Math.tanh)
		return this._o
	}

	grad(bo) {
		const bi = this._o.copyMap(v => 1 - v ** 2)
		bi.mult(bo)
		return bi
	}
}
