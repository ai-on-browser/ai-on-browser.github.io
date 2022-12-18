import Layer from './base.js'

export default class PadeActivationUnitLayer extends Layer {
	constructor({ m = 2, n = 2, a = 0.1, b = 0, ...rest }) {
		super(rest)
		this._m = m
		this._n = n
		this._a = Array.isArray(a) ? a : Array(m + 1).fill(1)
		this._b = Array.isArray(b) ? b : Array(n).fill(1)
		this._l2_decay = 0.001
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(
			v =>
				this._a.reduce((s, a, k) => s + a * v ** k, 0) /
				(1 + Math.abs(this._b.reduce((s, b, k) => s + b * v ** (k + 1), 0)))
		)
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => {
			const p = this._a.reduce((s, v, k) => s + v * b ** k, 0)
			const A = this._b.reduce((s, v, k) => s + v * b ** (k + 1), 0)
			const q = 1 + Math.abs(A)
			return (
				a *
				(this._a.reduce((s, v, k) => s + v * k * b ** (k - 1), 0) / q -
					Math.sign(A) * this._b.reduce((s, v, k) => s + v * (k + 1) * b ** k, 0) * (p / q ** 2))
			)
		})
		return bi
	}

	update(optimizer) {
		const sa = Array(this._m + 1).fill(0)
		const sb = Array(this._n).fill(0)
		for (let i = 0; i < this._i.length; i++) {
			const p = this._a.reduce((s, v, k) => s + v * this._i.value[i] ** k, 0)
			const A = this._b.reduce((s, v, k) => s + v * this._i.value[i] ** (k + 1), 0)
			const q = 1 + Math.abs(A)
			for (let k = 0; k < this._m; k++) {
				sa[k] += this._bo.value[i] * this._i.value[i] ** k
			}
			for (let k = 0; k < this._n; k++) {
				sb[k] += this._bo.value[i] * (-(this._i.value[i] ** (k + 1)) * Math.sign(A) * (p / q ** 2))
			}
		}
		for (let k = 0; k < this._m + 1; k++) {
			this._a[k] -= optimizer.delta(`a${k}`, sa[k] / this._i.length)
		}
		for (let k = 0; k < this._n; k++) {
			this._b[k] -= optimizer.delta(`b${k + 1}`, sb[k] / this._i.length)
		}
	}

	toObject() {
		return {
			type: 'pau',
			m: this._m,
			n: this._n,
			a: this._a,
			b: this._b,
		}
	}
}

PadeActivationUnitLayer.registLayer('pau')
