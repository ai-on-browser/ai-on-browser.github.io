import Layer from './base.js'

/**
 * Bounded ReLU layer
 */
export default class BoundedReLULayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.a=1] a
	 */
	constructor({ a = 1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v <= 0 ? 0 : v >= this._a ? this._a : v))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => (0 < b && b < this._a ? a : 0))
		return bi
	}

	toObject() {
		return {
			type: 'brelu',
			a: this._a,
		}
	}
}

BoundedReLULayer.registLayer('brelu')
