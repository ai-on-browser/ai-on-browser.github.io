import Layer from './base.js'

export default class TanLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.tan)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / Math.cos(v) ** 2)
		bi.mult(bo)
		return bi
	}
}

TanLayer.registLayer()
