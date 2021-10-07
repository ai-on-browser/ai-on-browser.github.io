import Layer from './base.js'

export default class PowerLayer extends Layer {
	constructor({ n, ...rest }) {
		super(rest)
		this._n = n
	}

	calc(x) {
		this._i = x
		return x.copyMap(v => v ** this._n)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => this._n * v ** (this._n - 1))
		bi.mult(bo)
		return bi
	}
}
