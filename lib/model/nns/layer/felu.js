import Layer from './base.js'

/**
 * Fast ELU layer
 */
export default class FastELULayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.alpha] alpha
	 */
	constructor({ alpha = 1, ...rest }) {
		super(rest)
		this._alpha = alpha
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > 0 ? v : this._alpha * (Math.exp(v / Math.log(2)) - 1)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * (b > 0 ? 1 : (this._alpha / Math.log(2)) * Math.exp(b / Math.log(2)))
		)
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] > 0) {
				continue
			}
			s += this._bo.value[i] * (Math.exp(this._i.value[i] / Math.log(2)) - 1)
		}
		this._alpha -= optimizer.delta('alpha', s / this._i.length)
	}

	toObject() {
		return {
			type: 'felu',
			alpha: this._alpha,
		}
	}
}

FastELULayer.registLayer('felu')
