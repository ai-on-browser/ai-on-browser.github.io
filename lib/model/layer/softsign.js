import Layer from './base.js'

export default class SoftsignLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(v => v / (1 + Math.abs(v)))
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (1 + Math.abs(v)) ** 2)
		bi.mult(bo)
		return bi
	}
}
