import Layer from './base.js'

/**
 * Piecewise linear unit layer
 */
export default class PiecewiseLinearUnitLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.alpha] alpha
	 * @param {number} [config.c] b
	 */
	constructor({ alpha = 0.1, c = 1, ...rest }) {
		super(rest)
		this._alpha = alpha
		this._c = c
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => Math.max(this._alpha * (v + this._c) - this._c, Math.min(this._alpha * (v - this._c) + this._c, v)))
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) =>
				a *
				(b < this._alpha * (b + this._c) - this._c || this._alpha * (b - this._c) + this._c < b
					? this._alpha
					: 1)
		)
		return bi
	}

	toObject() {
		return {
			type: 'plu',
			alpha: this._alpha,
			c: this._c,
		}
	}
}

PiecewiseLinearUnitLayer.registLayer('plu')
