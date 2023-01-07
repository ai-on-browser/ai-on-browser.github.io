import Layer from './base.js'

/**
 * Parametric deformable ELU layer
 */
export default class ParametricDeformableELULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.t=0.1] t
	 * @param {number} [config.alpha=1] alpha
	 */
	constructor({ t = 0.1, alpha = 1, ...rest }) {
		super(rest)
		this._t = t
		this._alpha = alpha
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > 0 ? v : this._alpha * ((1 + (1 - this._t) * v) ** (1 / (1 - this._t)) - 1)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * (b > 0 ? 1 : this._alpha * (1 + (1 - this._t) * b) ** (this._t / (1 - this._t)))
		)
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] > 0) {
				continue
			}
			s += this._bo.value[i] * ((1 + (1 - this._t) * this._i.value[i]) ** (1 / (1 - this._t)) - 1)
		}
		this._alpha -= optimizer.delta('alpha', s / this._i.length)
	}

	toObject() {
		return {
			type: 'pdelu',
			t: this._t,
			alpha: this._alpha,
		}
	}
}

ParametricDeformableELULayer.registLayer('pdelu')
