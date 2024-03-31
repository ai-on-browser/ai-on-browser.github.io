import Layer from './base.js'

/**
 * Flexible ReLU layer
 */
export default class FlexibleReLULayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.b] b
	 */
	constructor({ b = 0, ...rest }) {
		super(rest)
		this._b = b
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > 0 ? v : 0) + this._b)
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => (b > 0 ? a : 0))
		return bi
	}

	update(optimizer) {
		const s = this._bo.reduce((s, v) => s + v, 0) / this._bo.length
		this._b -= optimizer.delta('bias', s)
	}

	toObject() {
		return {
			type: 'frelu',
			b: this._b,
		}
	}
}

FlexibleReLULayer.registLayer('frelu')
