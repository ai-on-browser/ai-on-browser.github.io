import Matrix from '../../util/matrix.js'

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
				const v = value.copy()
				v.map(v => v * this.lr)
				return v
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
					this.params[key] = value.copy()
				}
				this.params[key].broadcastOperate(value, (a, b) => a * this_._beta + b * (1 - this_._beta))
				const ret = this.params[key].copy()
				ret.map(v => v * this.lr)
				return ret
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
					this.params[key] = value.copy()
					this.params[key].broadcastOperate(value, (a, b) => a * b)
				}
				this.params[key].broadcastOperate(value, (a, b) => a * this_._beta + (1 - this_._beta) * b * b)
				const ret = value.copy()
				ret.broadcastOperate(this.params[key], (a, b) => a * (this.lr / Math.sqrt(b + 1.0e-12)))
				return ret
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
					const s = value.copy()
					s.broadcastOperate(value, (a, b) => a * b)
					this.params[key] = {
						v: value.copy(),
						s: s,
					}
				}
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._beta1 + b * (1 - this_._beta1))
				this.params[key].s.broadcastOperate(value, (a, b) => a * this_._beta2 + (1 - this_._beta2) * b * b)
				const ret = this.params[key].v.copy()
				ret.broadcastOperate(this.params[key].s, (a, b) => a * (this.lr / Math.sqrt(b + 1.0e-12)))
				return ret
			},
		}
	}
}
