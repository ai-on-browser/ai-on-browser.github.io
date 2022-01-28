import Layer from './base.js'

export default class ELULayer extends Layer {
	constructor({ a = 1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._o = x.copyMap(v => (v > 0 ? v : this._a * (Math.exp(v) - 1)))
		return this._o
	}

	grad(bo) {
		const bi = this._o.copyMap(v => (v > 0 ? 1 : this._a * Math.exp(v)))
		bi.mult(bo)
		return bi
	}

	toObject() {
		return {
			type: 'elu',
			a: this._a,
		}
	}
}

ELULayer.registLayer('elu')
