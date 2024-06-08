import Matrix from '../../../util/matrix.js'

export class RMSPropGravesOptimizer {
	constructor(lr = 0.0001, beta = 0.95) {
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
					this.params[key] = { m: z.copy(), v: z }
				}
				this.params[key].m.broadcastOperate(value, (a, b) => a * this_._beta + b * (1 - this_._beta))
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._beta + b ** 2 * (1 - this_._beta))
				const ret = this.params[key].m.copy()
				ret.broadcastOperate(this.params[key].v, (a, b) => b - a ** 2)
				ret.broadcastOperate(value, (a, b) => (b * this.lr) / Math.sqrt(a + 1.0e-12))
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
