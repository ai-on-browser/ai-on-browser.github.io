import Matrix from '../../../util/matrix.js'

export class SMORMS3Optimizer {
	constructor(lr = 0.001) {
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
			params: {},
			delta(key, value) {
				const valueIsNumber = typeof value === 'number'
				if (valueIsNumber) {
					value = new Matrix(1, 1, value)
				}
				if (!this.params[key]) {
					const z = value.copy()
					z.fill(0)
					const o = value.copy()
					o.fill(1)
					this.params[key] = { s: o, m: z.copy(), v: z.copy() }
				}
				const rho = this.params[key].s.copy()
				rho.map(v => 1 / (v + 1))
				this.params[key].m.broadcastOperate(rho, (a, b) => a * (1 - b))
				const gm = rho.copy()
				gm.broadcastOperate(value, (a, b) => a * b)
				this.params[key].m.broadcastOperate(gm, (a, b) => a + b)
				this.params[key].v.broadcastOperate(rho, (a, b) => a * (1 - b))
				const gv = rho.copy()
				gv.broadcastOperate(value, (a, b) => a * b ** 2)
				this.params[key].v.broadcastOperate(gv, (a, b) => a + b)
				const z = this.params[key].m.copy()
				z.broadcastOperate(this.params[key].v, (a, b) => a ** 2 / (b + 1.0e-12))
				this.params[key].s.broadcastOperate(z, (a, b) => 1 + (1 - b) * a)
				const ret = z.copy()
				ret.broadcastOperate(this.params[key].v, (a, b) => Math.min(this.lr, a) / Math.sqrt(b + 1.0e-12))
				ret.broadcastOperate(value, (a, b) => a * b)
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
