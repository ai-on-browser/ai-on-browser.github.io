import Layer from './base.js'

export default class AtanhLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.atanh)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (1 - v ** 2))
		bi.mult(bo)
		return bi
	}
}

AtanhLayer.registLayer()
