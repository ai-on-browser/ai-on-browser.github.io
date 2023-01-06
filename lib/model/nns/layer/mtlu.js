import Layer from './base.js'

/**
 * Multibin trainable linear unit layer
 */
export default class MultibinTrainableLinearUnitLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | number[]} [config.a=1] a
	 * @param {number | number[]} [config.b=0] b
	 * @param {number | number[]} [config.c] c
	 * @param {number} [config.k=10] Number of units
	 */
	constructor({ a = 1, b = 0, c = null, k = 10, ...rest }) {
		super(rest)
		this._k = k
		this._a = Array.isArray(a) ? a : Array(k + 1).fill(a)
		this._b = Array.isArray(b) ? b : Array(k + 1).fill(b)
		this._c = c == null ? c : Array.isArray(c) ? c : Array(k).fill(c)
	}

	calc(x) {
		if (!this._c) {
			this._c = Array(this._k)
			const xmax = x.reduce((s, v) => Math.max(s, v), -Infinity)
			const xmin = x.reduce((s, v) => Math.min(s, v), Infinity)
			const step = (xmax - xmin) / (this._k + 1)
			for (let k = 0; k < this._k; k++) {
				this._c[k] = xmin + step * (k + 1)
			}
		}
		this._i = x
		const o = x.copy()
		o.map(v => {
			if (v <= this._c[0]) {
				return this._a[0] * v + this._b[0]
			}
			for (let k = 1; k < this._k; k++) {
				if (v <= this._c[k]) {
					return this._a[k] * v + this._b[k]
				}
			}
			return this._a[this._k] * v + this._b[this._k]
		})
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => {
			if (b <= this._c[0]) {
				return a * this._a[0]
			}
			for (let k = 1; k < this._k; k++) {
				if (b <= this._c[k]) {
					return a * this._a[k]
				}
			}
			return a * this._a[this._k]
		})
		return bi
	}

	update(optimizer) {
		const sa = Array(this._k + 1).fill(0)
		const sb = Array(this._k + 1).fill(0)
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] <= this._c[0]) {
				sa[0] += this._bo.value[i] * this._i.value[i]
				sb[0] += this._bo.value[i]
			} else if (this._i.value[i] > this._c[this._k - 1]) {
				sa[this._k] += this._bo.value[i] * this._i.value[i]
				sb[this._k] += this._bo.value[i]
			} else {
				for (let k = 1; k < this._k; k++) {
					if (this._i.value[i] <= this._c[k]) {
						sa[k] += this._bo.value[i] * this._i.value[i]
						sb[k] += this._bo.value[i]
						break
					}
				}
			}
		}
		for (let k = 0; k <= this._k; k++) {
			this._a[k] -= optimizer.delta(`a${k}`, sa[k] / this._i.length)
			this._b[k] -= optimizer.delta(`b${k}`, sb[k] / this._i.length)
		}
	}

	toObject() {
		return {
			type: 'mtlu',
			a: this._a,
			b: this._b,
			c: this._c,
			k: this._k,
		}
	}
}

MultibinTrainableLinearUnitLayer.registLayer('mtlu')
