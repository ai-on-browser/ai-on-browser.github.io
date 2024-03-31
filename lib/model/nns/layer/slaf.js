import Layer from './base.js'

/**
 * Self learnable AF layer
 */
export default class SelfLearnableAFLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.n] n
	 * @param {number | number[]} [config.a] a
	 */
	constructor({ n = 3, a = 1, ...rest }) {
		super(rest)
		this._n = n
		if (Array.isArray(a)) {
			this._a = a
		} else {
			this._a = Array(n).fill(a)
		}
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => this._a.reduce((s, a, k) => s + a * v ** k, 0))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * this._a.reduce((s, v, k) => s + k * v * b ** (k - 1), 0))
		return bi
	}

	update(optimizer) {
		const s = Array(this._n).fill(0)
		for (let i = 0; i < this._i.length; i++) {
			for (let k = 0; k < this._n; k++) {
				s[k] += this._bo.value[i] * this._i.value[i] ** k
			}
		}
		for (let k = 0; k < this._n; k++) {
			this._a[k] -= optimizer.delta(`a${k}`, s[k] / this._i.length)
		}
	}

	toObject() {
		return {
			type: 'slaf',
			n: this._n,
			a: this._a,
		}
	}
}

SelfLearnableAFLayer.registLayer('slaf')
