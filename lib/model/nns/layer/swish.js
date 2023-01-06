import Layer from './base.js'

/**
 * Swish layer
 */
export default class SwishLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.beta=1] beta
	 */
	constructor({ beta = 1, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => v / (1 + Math.exp(-this._beta * v)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) =>
				(a * (1 + (b * this._beta * Math.exp(-this._beta * b)) / (1 + Math.exp(-this._beta * b)))) /
				(1 + Math.exp(-this._beta * b))
		)
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			s +=
				this._bo.value[i] *
				((this._i.value[i] * Math.exp(-this._beta * this._i.value[i])) /
					(1 + Math.exp(-this._beta * this._i.value[i])) ** 2)
		}
		this._beta -= optimizer.delta('beta', s / this._i.length)
	}

	toObject() {
		return {
			type: 'swish',
			beta: this._beta,
		}
	}
}

SwishLayer.registLayer()
