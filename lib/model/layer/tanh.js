import Layer from './base.js'

export default class TanhLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.tanh)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / Math.cosh(v) ** 2)
		bi.mult(bo)
		return bi
	}
}
