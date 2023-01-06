import Layer from './base.js'

/**
 * Softplus linear unit layer
 */
export default class SoftplusLinearUnitLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.alpha=1] alpha
	 * @param {number} [config.beta=1] beta
	 * @param {number} [config.gamma=1] gamma
	 */
	constructor({ alpha = 1, beta = 1, gamma = 0, ...rest }) {
		super(rest)
		this._alpha = alpha
		this._beta = beta
		this._gamma = gamma
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v >= 0 ? this._alpha * v : this._beta * Math.log(Math.exp(v) + 1) - this._gamma))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * (b >= 0 ? this._alpha : (this._beta * Math.exp(b)) / (Math.exp(b) + 1))
		)
		return bi
	}

	update(optimizer) {
		let sa = 0
		let sb = 0
		let sg = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] >= 0) {
				sa += this._bo.value[i] * this._i.value[i]
			} else {
				sb += this._bo.value[i] * Math.log(Math.exp(this._i.value[i]) + 1)
				sg += this._bo.value[i]
			}
		}
		this._alpha -= optimizer.delta('alpha', sa / this._i.length)
		this._beta -= optimizer.delta('beta', sb / this._i.length)
		this._gamma -= optimizer.delta('gamma', sg / this._i.length)
	}

	toObject() {
		return {
			type: 'slu',
			alpha: this._alpha,
			beta: this._beta,
			gamma: this._gamma,
		}
	}
}

SoftplusLinearUnitLayer.registLayer('slu')
