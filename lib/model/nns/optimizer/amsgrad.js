import Matrix from '../../../util/matrix.js'

export class AMSGradOptimizer {
	constructor(lr = 0.001, beta1 = 0.9, beta2 = 0.999) {
		this._learningrate = lr
		this._beta1 = beta1
		this._beta2 = beta2
		this._a = t => this._learningrate / Math.sqrt(t)
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
					this.params[key] = { m: z.copy(), v: z.copy(), vh: z, t: 1 }
				}
				this.params[key].m.broadcastOperate(value, (a, b) => a * this_._beta1 + b * (1 - this_._beta1))
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._beta2 + b ** 2 * (1 - this_._beta2))
				this.params[key].vh.broadcastOperate(this.params[key].v, (a, b) => Math.max(a, b))
				const ret = this.params[key].m.copy()
				const lr = this_._a(this.params[key].t)
				ret.broadcastOperate(this.params[key].vh, (a, b) => (lr * a) / Math.sqrt(b + 1.0e-12))
				this.params[key].t++
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
