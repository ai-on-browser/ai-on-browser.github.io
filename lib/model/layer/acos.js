import Layer from './base.js'

export default class AcosLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.acos)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => -1 / (Math.sqrt(1 - v ** 2) + 1.0e-4))
		bi.mult(bo)
		return bi
	}
}

AcosLayer.registLayer()
