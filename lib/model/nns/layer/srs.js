import Layer from './base.js'

export default class SoftRootSignLayer extends Layer {
	constructor({ alpha = 3, beta = 2, ...rest }) {
		super(rest)
		this._alpha = alpha
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => v / (v / this._alpha + Math.exp(-v / this._beta)))
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) =>
				a *
				(((1 + b / this._beta) * Math.exp(-b / this._beta)) /
					(b / this._alpha + Math.exp(-b / this._beta)) ** 2)
		)
		return bi
	}

	toObject() {
		return {
			type: 'srs',
			alpha: this._alpha,
			beta: this._beta,
		}
	}
}

SoftRootSignLayer.registLayer('srs')
