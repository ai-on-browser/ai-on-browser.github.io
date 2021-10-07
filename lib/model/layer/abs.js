import Layer from './base.js'

export default class AbsLayer extends Layer {
	calc(x) {
		this._i = x
		this._o = x.copyMap(Math.abs)
		return this._o
	}

	grad(bo) {
		const bi = this._i.copyMap(v => (v < 0 ? -1 : 1))
		bi.mult(bo)
		return bi
	}
}
