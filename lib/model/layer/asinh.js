import Layer from './base.js'

export default class AsinhLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.asinh)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / Math.sqrt(1 + v ** 2))
		bi.mult(bo)
		return bi
	}
}

AsinhLayer.registLayer()
