import Layer from './base.js'

/**
 * Natural logarithm ReLU layer
 */
export default class NaturalLogarithmReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.beta] beta
	 */
	constructor({ beta = 1, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => Math.log(this._beta * (v > 0 ? v : 0) + 1))
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => (b >= 0 ? a * (this._beta / (this._beta * b + 1)) : 0))
		return bi
	}

	toObject() {
		return {
			type: 'nlrelu',
			beta: this._beta,
		}
	}
}

NaturalLogarithmReLULayer.registLayer('nlrelu')
