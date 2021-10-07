import Layer from './base.js'

export default class ReluLayer extends Layer {
	calc(x) {
		this._o = x.copyMap(v => (v > 0 ? v : 0))
		return this._o
	}

	grad(bo) {
		const bi = this._o.copyMap(v => (v > 0 ? 1 : 0))
		bi.mult(bo)
		return bi
	}
}
