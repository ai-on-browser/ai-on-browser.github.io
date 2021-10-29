import Layer from './base.js'

export default class PReLULayer extends Layer {
	constructor({ a = 0.25, ...rest }) {
		super(rest)
		this._a = a
		this._da = 0
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
		const myu = 0.1
		this._da = myu * this._da + (this._opt.lr * s) / this._i.length
		this._a -= this._da
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

PReLULayer.registLayer('prelu')
