import Matrix from '../../../util/matrix.js'

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
				const valueIsNumber = typeof value === 'number'
				if (valueIsNumber) {
					value = new Matrix(1, 1, value)
				}
				if (!this.params[key]) {
					const z = value.copy()
					z.fill(0)
					this.params[key] = { v: z.copy(), s: z, c: 1 }
				}
				this.params[key].v.broadcastOperate(value, (a, b) => a * this_._beta1 + b * (1 - this_._beta1))
				this.params[key].s.broadcastOperate(value, (a, b) => a * this_._beta2 + (1 - this_._beta2) * b * b)
				const nv = 1 - this_._beta1 ** this.params[key].c
				const ns = 1 - this_._beta2 ** this.params[key].c
				const ret = this.params[key].v.copy()
				ret.broadcastOperate(this.params[key].s, (a, b) => (a / nv) * (this.lr / Math.sqrt(b / ns + 1.0e-12)))
				this.params[key].c++
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
