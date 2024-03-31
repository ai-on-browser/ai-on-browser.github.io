import Matrix from '../util/matrix.js'
import { AdamOptimizer } from './nns/optimizer.js'

const ActivationFunctions = {
	identity: {
		calc: i => i,
		grad: () => 1,
	},
	relu: {
		calc: i => Math.max(0, i),
		grad: i => (i > 0 ? 1 : 0),
	},
	sigmoid: {
		calc: i => 1 / (1 + Math.exp(-i)),
		grad: (i, o) => o * (1 - o),
	},
	tanh: {
		calc: Math.tanh,
		grad: (i, o) => 1 - o ** 2,
	},
}

/**
 * RankNet
 */
export default class RankNet {
	// Learning to Rank using Gradient Descent
	// https://www.microsoft.com/en-us/research/wp-content/uploads/2005/08/icml_ranking.pdf
	/**
	 * @param {number[]} layer_sizes Sizes of all layers
	 * @param {string | string[]} [activations] Activation names
	 * @param {number} [rate] Learning rate
	 */
	constructor(layer_sizes, activations = 'tanh', rate = 0.01) {
		this._rate = rate

		this._layer_sizes = layer_sizes
		this._activations = activations
		this._a = []

		this._w = []
		this._b = []
		this._optimizer = new AdamOptimizer(rate).manager()
	}

	_init(sizes) {
		if (typeof this._activations === 'string') {
			this._activations = Array(sizes.length - 2).fill(this._activations)
		}
		for (let i = 0; i < sizes.length - 1; i++) {
			this._a[i] = ActivationFunctions[this._activations[i]]
			this._w[i] = Matrix.randn(sizes[i], sizes[i + 1], 0, 0.1)
			this._b[i] = Matrix.zeros(1, sizes[i + 1])
		}
	}

	_calc(x) {
		const ins = [x]
		const outs = [x]
		for (let i = 0; i < this._w.length; i++) {
			ins[i + 1] = x = x.dot(this._w[i])
			x.add(this._b[i])
			outs[i + 1] = x = x.copy()
			if (this._a[i]) {
				x.map(this._a[i].calc)
			}
		}
		return [ins, outs]
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x1 Training data 1
	 * @param {Array<Array<number>>} x2 Training data 2
	 * @param {Array<-1 | 0 | 1>} comp Sign of (data 1 rank - data 2 rank). If data 1 rank is bigger than data 2, corresponding value is 1.
	 * @returns {number} loss
	 */
	fit(x1, x2, comp) {
		if (this._w.length === 0) {
			const sizes = [x1[0].length, ...this._layer_sizes, 1]
			this._init(sizes)
		}
		const n = x1.length
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const [ins1, outs1] = this._calc(x1)
		const [ins2, outs2] = this._calc(x2)
		const o = Matrix.sub(outs1[outs1.length - 1], outs2[outs2.length - 1])
		let e1 = o.copy()
		let e2 = o.copy()
		let c = 0
		for (let i = 0; i < n; i++) {
			const pbar = comp[i] > 0 ? 1 : comp[i] === 0 ? 0.5 : 0
			const oi = o.value[i]
			e1.value[i] = -pbar + 1 / (1 + Math.exp(-oi))
			e2.value[i] = pbar - 1 / (1 + Math.exp(-oi))
			c += -pbar * oi + Math.log(1 + Math.exp(oi))
		}

		for (let i = this._w.length - 1; i >= 0; i--) {
			if (this._a[i]) {
				for (let k = 0; k < e1.length; k++) {
					e1.value[k] *= this._a[i].grad(ins1[i + 1].value[k], outs1[i + 1].value[k])
					e2.value[k] *= this._a[i].grad(ins2[i + 1].value[k], outs2[i + 1].value[k])
				}
			}
			const dw = outs1[i].tDot(e1)
			dw.add(outs2[i].tDot(e2))
			dw.div(n)
			const db = e1.mean(0)
			db.add(e2.mean(0))
			e1 = e1.dot(this._w[i].t)
			e2 = e2.dot(this._w[i].t)
			this._w[i].sub(this._optimizer.delta(`w${i}`, dw))
			this._b[i].sub(this._optimizer.delta(`b${i}`, db))
		}
		return c
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<number>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		const [, outs] = this._calc(x)
		return outs[outs.length - 1].value
	}
}
