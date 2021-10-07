import Layer from './base.js'

export default class LogLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMap(Math.log)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / v)
		bi.mult(bo)
		return bi
	}
}
