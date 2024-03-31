import Layer from './base.js'

/**
 * Hexpo layer
 */
export default class HexpoLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.a] a
	 * @param {number} [config.b] b
	 * @param {number} [config.c] c
	 * @param {number} [config.d] d
	 */
	constructor({ a = 1, b = 1, c = 1, d = 1, ...rest }) {
		super(rest)
		this._a = a
		this._b = b
		this._c = c
		this._d = d
	}

	calc(x) {
		this._i = x
		const o = this._i.copy()
		o.map(v => (v >= 0 ? -this._a * (Math.exp(-v / this._b) - 1) : this._c * (Math.exp(v / this._d) - 1)))
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) =>
				a *
				(b >= 0 ? (this._a / this._b) * Math.exp(-b / this._b) : (this._c / this._d) * Math.exp(b / this._d))
		)
		return bi
	}

	toObject() {
		return {
			type: 'hexpo',
			a: this._a,
			b: this._b,
			c: this._c,
			d: this._d,
		}
	}
}

HexpoLayer.registLayer('hexpo')
