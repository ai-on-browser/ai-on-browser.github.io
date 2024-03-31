import Layer from './base.js'

/**
 * Softplus layer
 */
export default class SoftplusLayer extends Layer {
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
		o.map(v => Math.log(1 + Math.exp(this._beta * v)) / this._beta)
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a / (1 + Math.exp(this._beta * b)))
		return bi
	}

	toObject() {
		return {
			type: 'softplus',
			beta: this._beta,
		}
	}
}

SoftplusLayer.registLayer()
