import Layer from './base.js'

/**
 * Bendable linear unit layer
 */
export default class BendableLinearUnitLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.beta=0.1] Beta
	 */
	constructor({ beta = 0.1, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => this._beta * (Math.sqrt(v ** 2 + 1) - 1) + v)
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * ((this._beta * b) / Math.sqrt(b ** 2 + 1) + 1))
		return bi
	}

	update(optimizer) {
		const s = this._bo.reduce((s, v, i) => s + v * (Math.sqrt(this._i.at(i) ** 2 + 1) - 1), 0) / this._bo.length
		this._beta -= optimizer.delta('beta', s)
		if (this._beta < -1) {
			this._beta = -1
		} else if (this._beta > 1) {
			this._beta = 1
		}
	}

	toObject() {
		return {
			type: 'blu',
			beta: this._beta,
		}
	}
}

BendableLinearUnitLayer.registLayer('blu')
