import Layer from './base.js'

/**
 * Parametric tanh linear unit layer
 */
export default class ParametricTanhLinearUnitLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.alpha] alpha
	 * @param {number} [config.beta] beta
	 */
	constructor({ alpha = 1, beta = 1, ...rest }) {
		super(rest)
		this._alpha = alpha
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > 0 ? v : this._alpha * Math.tanh(this._beta * v)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * (b > 0 ? 1 : this._alpha * this._beta * (1 - Math.tanh(this._beta * b) ** 2))
		)
		return bi
	}

	update(optimizer) {
		let sa = 0
		let sb = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] > 0) {
				continue
			}
			const ot = Math.tanh(this._beta * this._i.value[i])
			sa += this._bo.value[i] * ot
			sb += this._bo.value[i] * this._alpha * (1 - ot ** 2)
		}
		this._alpha -= optimizer.delta('alpha', sa / this._i.length)
		if (this._alpha < 0) {
			this._alpha = 0
		}
		this._beta -= optimizer.delta('beta', sb / this._i.length)
		if (this._beta < 0) {
			this._beta = 0
		}
	}

	toObject() {
		return {
			type: 'ptelu',
			alpha: this._alpha,
			beta: this._beta,
		}
	}
}

ParametricTanhLinearUnitLayer.registLayer('ptelu')
