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
				return Matrix.mult(value, this.lr)
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
					return Matrix.mult(value, this.lr)
				}
				const v = Matrix.mult(this.params[key], this_._beta)
				v.add(Matrix.mult(value, 1 - this_._beta))
				this.params[key] = v
				return Matrix.mult(v, this.lr)
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
					this.params[key] = Matrix.mult(value, value)
					return Matrix.mult(value, this.lr)
				}
				const v = Matrix.mult(this.params[key], this_._beta)
				v.add(Matrix.map(value, x => (1 - this_._beta) * x * x))
				this.params[key] = v
				return Matrix.mult(
					value,
					Matrix.map(v, x => this.lr / Math.sqrt(x + 1.0e-12))
				)
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
						s: Matrix.mult(value, value),
					}
					return Matrix.mult(value, this.lr)
				}
				const v = Matrix.mult(this.params[key].v, this_._beta1)
				v.add(Matrix.mult(value, 1 - this_._beta1))
				const s = Matrix.mult(this.params[key].s, this_._beta2)
				s.add(Matrix.map(value, x => (1 - this_._beta2) * x * x))
				this.params[key] = { v, s }
				return Matrix.mult(
					v,
					Matrix.map(s, x => this.lr / Math.sqrt(x + 1.0e-12))
				)
			},
		}
	}
}
