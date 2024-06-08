import Matrix from '../../../util/matrix.js'

export class AMSBoundOptimizer {
	constructor(lr = 0.001, alpha = 0.003, beta1 = 0.9, beta2 = 0.999) {
		this._learningrate = lr
		this._alpha = alpha
		this._beta1 = beta1
		this._beta2 = beta2

		this._eta_lbound = t => this._learningrate * (1 - 1 / ((1 - beta2) * t + 1))
		this._eta_ubound = t => this._learningrate * (1 + 1 / ((1 - beta2) * t + 1))
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
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._beta2 + (1 - this_._beta2) * b * b)
				this.params[key].vh.broadcastOperate(this.params[key].v, (a, b) => Math.max(a, b))
				const eta_lb = this_._eta_lbound(this.params[key].t)
				const eta_ub = this_._eta_ubound(this.params[key].t)
				const eta = this.params[key].vh.copy()
				eta.map(v => Math.min(eta_ub, Math.max(eta_lb, this_._alpha / Math.sqrt(v))))
				const ret = this.params[key].m.copy()
				ret.broadcastOperate(eta, (a, b) => (a * b) / Math.sqrt(this.params[key].t))
				this.params[key].t++
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
