import Layer from './base.js'

export default class ScaledELULayer extends Layer {
	constructor({ a = 1.67326319217681884765625, g = 1.05070102214813232421875, ...rest }) {
		super(rest)
		this._a = a
		this._g = g
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => this._g * (v > 0 ? v : this._a * (Math.exp(v) - 1)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * this._g * (b > 0 ? 1 : this._a * Math.exp(b)))
		return bi
	}

	toObject() {
		return {
			type: 'selu',
			a: this._a,
		}
	}
}

ScaledELULayer.registLayer('selu')
