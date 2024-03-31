import Layer from './base.js'

/**
 * Parametric rectified exponential unit layer
 */
export default class ParametricRectifiedExponentialUnitLayer extends Layer {
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
		o.map(v => this._alpha * v * (v > 0 ? 1 : Math.exp(this._beta * v)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * this._alpha * (b > 0 ? 1 : (1 + b * this._beta) * Math.exp(this._beta * b))
		)
		return bi
	}

	update(optimizer) {
		let sa = 0
		let sb = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] > 0) {
				sa += this._bo.value[i] * this._i.value[i]
			} else {
				sa += this._bo.value[i] * (this._i.value[i] * Math.exp(this._beta * this._i.value[i]))
				sb +=
					this._bo.value[i] * (this._alpha * this._i.value[i] ** 2 * Math.exp(this._beta * this._i.value[i]))
			}
		}
		this._alpha -= optimizer.delta('alpha', sa / this._i.length)
		this._beta -= optimizer.delta('beta', sb / this._i.length)
	}

	toObject() {
		return {
			type: 'preu',
			alpha: this._alpha,
			beta: this._beta,
		}
	}
}

ParametricRectifiedExponentialUnitLayer.registLayer('preu')
