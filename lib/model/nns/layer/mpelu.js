import Layer from './base.js'

/**
 * Multiple parametric ELU layer
 */
export default class MultipleParametricELULayer extends Layer {
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
		o.map(v => (v > 0 ? v : this._alpha * (Math.exp(this._beta * v) - 1)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b > 0 ? 1 : this._alpha * this._beta * Math.exp(this._beta * b)))
		return bi
	}

	update(optimizer) {
		let sa = 0
		let sb = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] > 0) {
				continue
			}
			sa += this._bo.value[i] * (Math.exp(this._beta * this._i.value[i]) - 1)
			sb += this._bo.value[i] * (this._alpha * this._i.value[i] * Math.exp(this._beta * this._i.value[i]))
		}
		this._alpha -= optimizer.delta('alpha', sa / this._i.length)
		this._beta -= optimizer.delta('beta', sb / this._i.length)
	}

	toObject() {
		return {
			type: 'mpelu',
			alpha: this._alpha,
			beta: this._beta,
		}
	}
}

MultipleParametricELULayer.registLayer('mpelu')
