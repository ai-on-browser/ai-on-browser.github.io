import Layer from './base.js'

/**
 * Hard sigmoid layer
 */
export default class HardSigmoidLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.alpha] alpha
	 * @param {number} [config.beta] beta
	 */
	constructor({ alpha = 0.2, beta = 0.5, ...rest }) {
		super(rest)
		this._alpha = alpha
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => Math.max(0, Math.min(1, this._alpha * v + this._beta)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * (b < -this._beta / this._alpha || this._beta / this._alpha < b ? 0 : this._alpha)
		)
		return bi
	}

	toObject() {
		return {
			type: 'hard_sigmoid',
			alpha: this._alpha,
			beta: this._beta,
		}
	}
}

HardSigmoidLayer.registLayer()
