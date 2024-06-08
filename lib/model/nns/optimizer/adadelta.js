import Matrix from '../../../util/matrix.js'

export class AdaDeltaOptimizer {
	constructor(lr, beta = 0.95) {
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
				const valueIsNumber = typeof value === 'number'
				if (valueIsNumber) {
					value = new Matrix(1, 1, value)
				}
				if (!this.params[key]) {
					const z = value.copy()
					z.fill(0)
					this.params[key] = { v: z.copy(), u: z }
				}
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._beta + (1 - this_._beta) * b ** 2)
				const ret = this.params[key].v.copy()
				ret.broadcastOperate(this.params[key].u, (a, b) => Math.sqrt(b + 1.0e-12) / Math.sqrt(a + 1.0e-12))
				ret.broadcastOperate(value, (a, b) => a * b)
				this.params[key].u.broadcastOperate(ret, (a, b) => a * this_._beta + (1 - this_._beta) * b ** 2)
				ret.map(v => this.lr * v)
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
