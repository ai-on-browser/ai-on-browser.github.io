import Layer from './base.js'

/**
 * Improved sigmoid layer
 */
export default class ImprovedSigmoidLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.a] a
	 * @param {number} [config.alpha] alpha
	 */
	constructor({ a = 1, alpha = 1, ...rest }) {
		super(rest)
		this._a = a
		this._alpha = alpha
	}

	calc(x) {
		const sigmap = 1 / (1 + Math.exp(-this._a))
		const sigmam = 1 / (1 + Math.exp(this._a))
		this._i = x
		this._o = x.copy()
		this._o.map(v =>
			-this._a < v && v < this._a
				? 1 / (1 + Math.exp(-v))
				: v >= this._a
					? sigmap + this._alpha * (v - this._a)
					: sigmam + this._alpha * (v + this._a)
		)
		return this._o
	}

	grad(bo) {
		const sigmap = 1 / (1 + Math.exp(-this._a))
		const sigmam = 1 / (1 + Math.exp(this._a))
		const bi = bo.copy()
		bi.broadcastOperate(this._o, (a, b) => a * (sigmam < b && b < sigmap ? b * (1 - b) : this._alpha))
		return bi
	}

	toObject() {
		return {
			type: 'isigmoid',
			a: this._a,
			alpha: this._alpha,
		}
	}
}

ImprovedSigmoidLayer.registLayer('isigmoid')
