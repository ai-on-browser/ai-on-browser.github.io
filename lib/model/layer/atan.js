import Layer from './base.js'

export default class AtanLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.atan)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (1 + v ** 2))
		bi.mult(bo)
		return bi
	}
}

AtanLayer.registLayer()
