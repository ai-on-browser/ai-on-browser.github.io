import Layer from './base.js'

export default class SigmoidLayer extends Layer {
	constructor({ a = 1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._o = x.copy()
		this._o.map(v => 1 / (1 + Math.exp(-this._a * v)))
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._o, (a, b) => a * b * (1 - b))
		return bi
	}

	toObject() {
		return {
			type: 'sigmoid',
			a: this._a,
		}
	}
}

SigmoidLayer.registLayer()
