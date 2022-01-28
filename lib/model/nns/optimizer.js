export class SGDOptimizer {
	constructor(lr) {
		this._learningrate = lr
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
			delta(key, value) {
				return value.copyMult(this.lr)
			},
		}
	}
}

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
				if (!this.params[key]) {
					this.params[key] = value
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMult(1 - this_._beta))
				this.params[key] = v
				return v.copyMult(this.lr)
			},
		}
	}
}

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
				if (!this.params[key]) {
					this.params[key] = value.copyMult(value)
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMap(x => (1 - this_._beta) * x * x))
				this.params[key] = v
				return value.copyMult(v.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			},
		}
	}
}

export class AdamOptimizer {
	constructor(lr = 0.001, beta1 = 0.9, beta2 = 0.999) {
		this._learningrate = lr
		this._beta1 = beta1
		this._beta2 = beta2
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
				if (!this.params[key]) {
					this.params[key] = {
						v: value,
						s: value.copyMult(value),
					}
					return value.copyMult(this.lr)
				}
				const v = this.params[key].v.copyMult(this_._beta1)
				v.add(value.copyMult(1 - this_._beta1))
				const s = this.params[key].s.copyMult(this_._beta2)
				s.add(value.copyMap(x => (1 - this_._beta2) * x * x))
				this.params[key] = { v, s }
				return v.copyMult(s.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			},
		}
	}
}
