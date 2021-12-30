import Layer from './base.js'

export default class CoshLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.cosh)
	}

	grad(bo) {
		const bi = this._i.copyMap(Math.sinh)
		bi.mult(bo)
		return bi
	}
}

CoshLayer.registLayer()
