import Layer from './base.js'

export default class SinLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.sin)
	}

	grad(bo) {
		const bi = this._i.copyMap(Math.cos)
		bi.mult(bo)
		return bi
	}
}

SinLayer.registLayer()
