export class MomentumOptimizer {
	constructor(lr, beta = 0.9) {
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
					this.params[key] = value * this.lr - (this.params[key] ?? 0) * this_._beta
					return this.params[key]
				}
				if (!this.params[key]) {
					this.params[key] = value.copy()
					this.params[key].fill(0)
				}
				this.params[key].broadcastOperate(value, (a, b) => b * this.lr - a * this_._beta)
				const ret = this.params[key].copy()
				return ret
			},
		}
	}
}
