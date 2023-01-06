import Layer from './base.js'

/**
 * Aranda layer
 */
export default class ArandaLayer extends Layer {
	// Optimization of the weights and asymmetric activation function family of neural network for time series forecasting
	/**
	 * @param {object} config object
	 * @param {number} [config.l=2] Parameter
	 */
	constructor({ l = 2, ...rest }) {
		super(rest)
		this._l = l
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => 1 - 1 / (1 + this._l * Math.exp(v)) ** (1 / this._l))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * Math.exp(b) * (1 + this._l * Math.exp(b)) ** (-1 / this._l - 1))
		return bi
	}

	toObject() {
		return {
			type: 'aranda',
			l: this._l,
		}
	}
}

ArandaLayer.registLayer('aranda')
