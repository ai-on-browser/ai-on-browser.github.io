import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class PReLULayer extends Layer {
	constructor({ a = 0.01, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._i = x
		this._o = this._i.copyMap(v => (v > 0 ? v : this._a * v))
		return this._o
	}

	grad(bo) {
		this._bo = bo
		const bi = this._i.copyMap(v => (v > 0 ? 1 : this._a))
		bi.mult(bo)
		return bi
	}

	update() {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] < 0) {
				s += this._bo.value[i] * this._i.value[i]
			}
		}
		this._a -= this._opt.delta('a', Matrix.fromArray(s / this._i.length)).at(0, 0)
	}

	get_params() {
		return {
			a: this._a,
		}
	}

	set_params(param) {
		this._a = param.a
	}
}
