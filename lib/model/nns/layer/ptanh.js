import Layer from './base.js'

/**
 * Penalized tanh layer
 */
export default class PenalizedTanhLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.a] a
	 */
	constructor({ a = 0.25, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._o = x.copy()
		this._o.map(v => Math.tanh(v) * (v < 0 ? this._a : 1))
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._o, (a, b) => a * (1 - b ** 2) * (b < 0 ? this._a : 1))
		return bi
	}

	toObject() {
		return {
			type: 'ptanh',
			a: this._a,
		}
	}
}

PenalizedTanhLayer.registLayer('ptanh')
