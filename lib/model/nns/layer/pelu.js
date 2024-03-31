import Layer from './base.js'

/**
 * Parametric ELU layer
 */
export default class ParametricELULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.a] a
	 * @param {number} [config.b] b
	 */
	constructor({ a = 1, b = 1, ...rest }) {
		super(rest)
		this._a = a
		this._b = b
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => this._a * (v >= 0 ? v / this._b : Math.exp(v / this._b) - 1))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => ((a * this._a) / this._b) * (b >= 0 ? 1 : Math.exp(b / this._b)))
		return bi
	}

	update(optimizer) {
		let sa = 0
		let sb = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] >= 0) {
				sa += this._bo.value[i] * (this._i.value[i] / this._b)
				sb += this._bo.value[i] * ((-this._a * this._i.value[i]) / this._b ** 2)
			} else {
				sa += this._bo.value[i] * (Math.exp(this._i.value[i] / this._b) - 1)
				sb +=
					this._bo.value[i] *
					(this._a * Math.exp(this._i.value[i] / this._b) * (-this._i.value[i] / this._b ** 2))
			}
		}
		this._a -= optimizer.delta('a', sa / this._i.length)
		if (this._a < 0.1) {
			this._a = 0.1
		}
		this._b -= optimizer.delta('b', sb / this._i.length)
		if (this._b < 0.1) {
			this._b = 0.1
		}
	}

	toObject() {
		return {
			type: 'pelu',
			a: this._a,
			b: this._b,
		}
	}
}

ParametricELULayer.registLayer('pelu')
