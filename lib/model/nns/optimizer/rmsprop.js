export class RMSPropOptimizer {
	constructor(lr, beta = 0.999) {
		this._learningrate = lr
		this._beta = beta
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
				if (typeof value === 'number') {
					this.params[key] = (this.params[key] ?? 0) * this_._beta + (1 - this_._beta) * value ** 2
					return (this.lr * value) / Math.sqrt(this.params[key] + 1.0e-12)
				}
				if (!this.params[key]) {
					this.params[key] = value.copy()
					this.params[key].fill(0)
				}
				this.params[key].broadcastOperate(value, (a, b) => a * this_._beta + (1 - this_._beta) * b * b)
				const ret = value.copy()
				ret.broadcastOperate(this.params[key], (a, b) => a * (this.lr / Math.sqrt(b + 1.0e-12)))
				return ret
			},
		}
	}
}
