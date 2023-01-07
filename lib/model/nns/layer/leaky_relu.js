import Layer from './base.js'

/**
 * Leaky ReLU layer
 */
export default class LeakyReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.a=0.1] a
	 */
	constructor({ a = 0.1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._i = x
		this._o = x.copy()
		this._o.map(v => (v > 0 ? v : v * this._a))
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b > 0 ? 1 : this._a))
		return bi
	}

	toObject() {
		return {
			type: 'leaky_relu',
			a: this._a,
		}
	}
}

LeakyReLULayer.registLayer('leaky_relu')
