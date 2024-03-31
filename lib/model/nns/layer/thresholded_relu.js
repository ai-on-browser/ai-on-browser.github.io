import Layer from './base.js'

/**
 * Thresholded ReLU layer
 */
export default class ThresholdedReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.a] a
	 */
	constructor({ a = 1.0, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > this._a ? v : 0))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b > this._a ? 1 : 0))
		return bi
	}

	toObject() {
		return {
			type: 'thresholded_relu',
			a: this._a,
		}
	}
}

ThresholdedReLULayer.registLayer('thresholded_relu')
