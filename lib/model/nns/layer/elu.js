import Layer from './base.js'

export default class ELULayer extends Layer {
	constructor({ a = 1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._o = x.copy()
		this._o.map(v => (v > 0 ? v : this._a * (Math.exp(v) - 1)))
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._o, (a, b) => a * (b > 0 ? 1 : this._a * Math.exp(b)))
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
