import Layer from './base.js'

/**
 * Adaptive piecewise linear layer
 */
export default class AdaptivePiecewiseLinearLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.s] Number of hinges
	 * @param {number | number[]} [config.a] Variables control the slopes of the linear segments
	 * @param {number | number[]} [config.b] Variables determine the locations of the hinges
	 */
	constructor({ s = 2, a = null, b = 0, ...rest }) {
		super(rest)
		this._s = s
		if (Array.isArray(a)) {
			this._a = a
		} else {
			this._a = []
			for (let k = 0; k < s; k++) {
				this._a[k] = a ?? Math.random()
			}
		}
		this._b = Array.isArray(b) ? b : Array(s).fill(b)
		this._l2_decay = 0.001
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => this._a.reduce((s, a, k) => s + a * Math.max(0, this._b[k] - v), Math.max(0, v)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => a * this._a.reduce((s, v, k) => s + (this._b[k] - b > 0 ? v : 0), b > 0 ? 1 : 0)
		)
		return bi
	}

	update(optimizer) {
		const sa = Array(this._s).fill(0)
		const sb = Array(this._s).fill(0)
		for (let i = 0; i < this._i.length; i++) {
			for (let k = 0; k < this._s; k++) {
				if (this._b[k] - this._i.value[i] > 0) {
					sa[k] += this._bo.value[i] * (this._b[k] - this._i.value[i])
					sb[k] += this._bo.value[i] * this._a[k]
				}
			}
		}
		for (let k = 0; k < this._s; k++) {
			this._a[k] -= optimizer.delta(`a${k}`, sa[k] / this._i.length + this._a[k] * this._l2_decay)
			this._b[k] -= optimizer.delta(`b${k}`, sb[k] / this._i.length + this._b[k] * this._l2_decay)
		}
	}

	toObject() {
		return {
			type: 'apl',
			s: this._s,
			a: this._a,
			b: this._b,
		}
	}
}

AdaptivePiecewiseLinearLayer.registLayer('apl')
