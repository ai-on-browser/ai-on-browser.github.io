import Matrix from '../../../util/matrix.js'

export class SantaSSSOptimizer {
	constructor(lr = 0.01, sigma = 0.95, burnin = 100, c = 5, n = 16, lambda = 0.01) {
		this._learningrate = lr
		this._sigma = sigma
		this._beta = t => t ** 0.5
		this._burnin = burnin
		this._c = c
		this._n = n
		this._lambda = lambda
		this._z = () => {
			const x = Math.random()
			const y = Math.random()
			return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
		}
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
					const a = value.copy()
					a.fill(Math.sqrt(this.lr) * this_._c)
					const u = value.copy()
					u.map(() => Math.sqrt(this.lr) * this_._z())
					this.params[key] = { v: z.copy(), g: z, a, u, t: 1 }
				}
				this.params[key].v.broadcastOperate(
					value,
					(a, b) => a * this_._sigma + (b ** 2 * (1 - this_._sigma)) / this_._n ** 2
				)
				const gp = this.params[key].g.copy()
				const up = this.params[key].u.copy()
				this.params[key].g = this.params[key].v.copy()
				this.params[key].g.map(v => 1 / Math.sqrt(this_._lambda + Math.sqrt(v)))
				if (this.params[key].t < this_._burnin) {
					const beta = this_._beta(this.params[key].t)
					const lrbeta = this.lr / beta
					this.params[key].a.broadcastOperate(this.params[key].u, (a, b) => a + (b ** 2 - lrbeta) / 2)
					this.params[key].u.broadcastOperate(this.params[key].a, (a, b) => Math.exp(-b / 2) * a)
					const gg = gp.copy()
					gg.broadcastOperate(this.params[key].g, (a, b) => a / b)
					gg.broadcastOperate(up, (a, b) => (lrbeta * (1 - a)) / b)
					this.params[key].u.broadcastOperate(gg, (a, b) => a + b)
					this.params[key].u.broadcastOperate(gp, (a, b) => a + Math.sqrt(2 * lrbeta * b) * this_._z())
					const gv = this.params[key].g.copy()
					gv.broadcastOperate(value, (a, b) => a * b)
					this.params[key].u.broadcastOperate(gv, (a, b) => a - this.lr * b)
					this.params[key].u.broadcastOperate(this.params[key].a, (a, b) => Math.exp(-b / 2) * a)
					this.params[key].a.broadcastOperate(this.params[key].u, (a, b) => a + (b ** 2 - lrbeta) / 2)
				} else {
					this.params[key].u.broadcastOperate(this.params[key].a, (a, b) => Math.exp(-b / 2) * a)
					const gv = this.params[key].g.copy()
					gv.broadcastOperate(value, (a, b) => a * b)
					this.params[key].u.broadcastOperate(gv, (a, b) => a - this.lr * b)
					this.params[key].u.broadcastOperate(this.params[key].a, (a, b) => Math.exp(-b / 2) * a)
				}
				const gup = this.params[key].g.copy()
				gup.broadcastOperate(up, (a, b) => (a * b) / 2)
				const gu = this.params[key].g.copy()
				gu.broadcastOperate(this.params[key].u, (a, b) => (a * b) / 2)

				const ret = gup.copy()
				ret.broadcastOperate(gu, (a, b) => -a - b)
				this.params[key].t++
				return valueIsNumber ? ret.toScaler() : ret
			},
		}
	}
}
