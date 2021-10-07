import Layer from './base.js'

export default class SigmoidLayer extends Layer {
	constructor({ a = 1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._o = x.copyMap(v => 1 / (1 + Math.exp(-this._a * v)))
		return this._o
	}

	grad(bo) {
		const bi = this._o.copyMap(v => v * (1 - v))
		bi.mult(bo)
		return bi
	}
}
