import Layer from './base.js'

export default class SinhLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.sinh)
	}

	grad(bo) {
		const bi = this._i.copyMap(Math.cosh)
		bi.mult(bo)
		return bi
	}
}

SinhLayer.registLayer()
