import Layer from './base.js'

export default class LeakyReluLayer extends Layer {
	constructor({ a = 0.1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._i = x
		this._o = this._i.copyMap(v => (v > 0 ? v : v * this._a))
		return this._o
	}

	grad(bo) {
		const bi = this._i.copyMap(v => (v > 0 ? 1 : this._a))
		bi.mult(bo)
		return bi
	}
}
