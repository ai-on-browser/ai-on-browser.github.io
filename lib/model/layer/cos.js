import Layer from './base.js'

export default class CosLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.cos)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => -Math.sin(v))
		bi.mult(bo)
		return bi
	}
}

CosLayer.registLayer()
