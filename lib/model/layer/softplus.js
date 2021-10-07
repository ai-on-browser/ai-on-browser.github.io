import Layer from './base.js'

export default class SoftplusLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(v => Math.log(1 + Math.exp(v)))
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (1 + Math.exp(-v)))
		bi.mult(bo)
		return bi
	}
}
