import Matrix from '../../../util/matrix.js'

export class NadamOptimizer {
	constructor(lr = 0.002, mu = 0.975, nu = 0.999) {
		this._learningrate = lr
		this._mu = mu
		this._nu = nu
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				const valueIsNumber = typeof value === 'number'
				if (valueIsNumber) {
					value = new Matrix(1, 1, value)
				}
				if (!this.params[key]) {
					const z = value.copy()
					z.fill(0)
					this.params[key] = { m: z.copy(), v: z, t: 1 }
				}
				this.params[key].m.broadcastOperate(value, (a, b) => a * this_._mu + b * (1 - this_._mu))
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._nu + b ** 2 * (1 - this_._nu))
				const t = this.params[key].t
				const mh = this.params[key].m.copy()
				mh.broadcastOperate(
					value,
					(a, b) =>
						(a * this_._mu) / (1 - this_._mu ** (t + 1)) + (b * (1 - this_._mu)) / (1 - this_._mu ** t)
				)
				const nv = this_._nu / (1 - this_._nu ** t)
				const ret = this.params[key].v.copy()
				ret.broadcastOperate(mh, (a, b) => (this.lr * b) / Math.sqrt(nv * a + 1.0e-12))
				this.params[key].t++
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
