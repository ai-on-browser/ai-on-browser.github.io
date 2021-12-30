import Layer from './base.js'

export default class AcoshLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.acosh)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (Math.sqrt(v ** 2 - 1) + 1.0e-4))
		bi.mult(bo)
		return bi
	}
}

AcoshLayer.registLayer()
