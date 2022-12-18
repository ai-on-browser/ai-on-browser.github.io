import Layer from './base.js'

export default class ScaledTanhLayer extends Layer {
	constructor({ a = 1, b = 1, ...rest }) {
		super(rest)
		this._a = a
		this._b = b
	}

	calc(x) {
		this._o = x.copy()
		this._o.map(v => this._a * Math.tanh(this._b * v))
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._o, (a, b) => a * (this._a * this._b - (this._b / this._a) * b ** 2))
		return bi
	}

	toObject() {
		return {
			type: 'stanh',
			a: this._a,
			b: this._b,
		}
	}
}

ScaledTanhLayer.registLayer('stanh')
