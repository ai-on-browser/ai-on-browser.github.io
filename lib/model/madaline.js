class ADALINE {
	constructor(rate, activation = 'step') {
		this._r = rate
		if (activation === 'step') {
			this._a = x => (x <= 0 ? -1 : 1)
		} else if (activation === 'sigmoid') {
			this._a = x => 1 / (1 + Math.exp(-x))
		}

		this._w = null
		this._b = 0
	}

	_init(x) {
		if (!this._w) {
			this._w = []
			for (let i = 0; i < x[0].length; i++) {
				this._w[i] = Math.random() - 0.5
			}
		}
	}

	fit(x, d) {
		this._init(x)

		const dw = Array(this._w.length).fill(0)
		let db = 0
		for (let i = 0; i < x.length; i++) {
			const e = d[i]
			for (let j = 0; j < x[i].length; j++) {
				dw[j] += x[i][j] * e
			}
			db += e
		}

		for (let j = 0; j < this._w.length; j++) {
			this._w[j] += (dw[j] * this._r) / x.length
		}
		this._b += (db * this._r) / x.length
	}

	output(data) {
		this._init(data)

		const p = []
		for (let i = 0; i < data.length; i++) {
			const o = this._w.reduce((s, v, j) => s + v * data[i][j], this._b)
			p[i] = o
		}
		return [p, p.map(this._a)]
	}
}

/**
 * Many Adaptive Linear Neuron model
 */
export default class MADALINE {
	// https://en.wikipedia.org/wiki/ADALINE#MADALINE
	// 30 years of adaptive neural networks: perceptron, madaline, and backpropagation
	// https://web.stanford.edu/class/ee373b/30years.pdf
	/**
	 * @param {number[]} sizes Numbers of layers
	 * @param {1 | 2 | 3} [rule=2] Rule
	 * @param {number} rate Learning rate
	 */
	constructor(sizes, rule = 2, rate) {
		if (rule === 1 && sizes.length > 1) {
			throw new Error('When the rule is 1, only single layer is accepted.')
		}

		this._sizes = sizes
		this._rule = rule
		this._rate = rate
		this._logic = 'maj'

		this._layers = []
		for (let k = 0; k < this._sizes.length; k++) {
			this._layers[k] = []
			for (let j = 0; j < this._sizes[k]; j++) {
				this._layers[k][j] = new ADALINE(rate, rule === 3 ? 'sigmoid' : 'step')
			}
		}
	}

	/**
	 * Fit this model once.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<1 | -1>> | Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		if (!Array.isArray(y[0])) {
			y = y.map(v => [v])
		}
		if (this._rule !== 1 && this._sizes.length === this._layers.length) {
			const outLayers = []
			for (let i = 0; i < y[0].length; i++) {
				outLayers.push(new ADALINE(this._rate, this._rule === 3 ? 'sigmoid' : 'step'))
			}
			this._layers.push(outLayers)
		}
		const n = x.length

		const idx = Array.from(x, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[idx[i], idx[r]] = [idx[r], idx[i]]
		}
		x = idx.map(i => x[i])
		y = idx.map(i => y[i])
		if (this._rule === 1) {
			for (let i = 0; i < x.length; i++) {
				this._fit1([x[i]], [y[i]])
			}
		} else if (this._rule === 2) {
			for (let i = 0; i < x.length; i++) {
				this._fit2([x[i]], [y[i]])
			}
		} else {
			for (let i = 0; i < x.length; i++) {
				this._fit3([x[i]], [y[i]])
			}
		}
	}

	_fit1(x, y) {
		const n = x.length
		const p = this.outputLayers(x)
		const o = p[p.length - 1]
		const l1 = p[0]
		for (let k = 0; k < this._layers[0].length; k++) {
			const xk = []
			const dk = []
			for (let i = 0; i < n; i++) {
				if (o[i][0] !== y[i][0] && (l1[i][k] <= 0 ? -1 : 1) !== y[i][0]) {
					xk.push(x[i])
					dk.push(y[i][0] - l1[i][k])
				}
			}
			if (xk.length > 0) {
				this._layers[0][k].fit(xk, dk)
			}
		}
	}

	_fit2(x, y) {
		const n = x.length
		const stepfn = x => (x <= 0 ? -1 : 1)
		for (let k = 0; k < this._layers.length - 1; k++) {
			const p = this.outputLayers(x)
			const kout = p[k]
			const kin = k === 0 ? x : p[k - 1].map(v => v.map(stepfn))
			const o = p[p.length - 1]
			let e = 0
			const conf = Array.from(this._layers[k], (_, k) => [0, k])
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < kout[i].length; j++) {
					conf[j][0] += Math.abs(kout[i][j]) / n
				}
				e += o[i].reduce((s, v, j) => s + (stepfn(v) - y[i][j]) ** 2, 0)
			}
			conf.sort((a, b) => a[0] - b[0])
			for (let t = 0; t < Math.ceil(conf.length / 2); t++) {
				const j = conf[t][1]
				const newx = []
				for (let i = 0; i < n; i++) {
					newx[i] = kout[i].concat()
					newx[i][j] = -newx[i][j]
				}

				const pj = this.outputLayers(newx, k + 1)
				const oj = pj[pj.length - 1]
				let ej = 0
				for (let i = 0; i < n; i++) {
					ej += oj[i].reduce((s, v, d) => s + (stepfn(v) - y[i][d]) ** 2, 0)
				}
				if (e <= ej) {
					continue
				}

				this._layers[k][j].fit(
					kin,
					newx.map((v, i) => v[j] - kout[i][j])
				)
			}
		}

		const lastLayer = this._layers[this._layers.length - 1]
		const p = this.outputLayers(x)
		for (let j = 0; j < lastLayer.length; j++) {
			lastLayer[j].fit(
				p[p.length - 2].map(v => v.map(stepfn)),
				p[p.length - 1].map((v, i) => y[i][j] - stepfn(v[j]))
			)
		}
	}

	_fit3(x, y) {
		const n = x.length
		const ds = 1.0e-4
		for (let k = 0; k < this._layers.length - 1; k++) {
			for (let j = 0; j < this._layers[k].length; j++) {
				const activation = this._layers[k][j]._a
				const p = this.outputLayers(x)
				const kout = p[k]
				const kin = k === 0 ? x : p[k - 1].map(v => v.map(d => (d <= 0 ? -1 : 1)))
				const o = p[p.length - 1]
				let e = 0
				for (let i = 0; i < n; i++) {
					e += o[i].reduce((s, v, d) => s + (activation(v) - y[i][d]) ** 2, 0)
				}
				e /= n

				const newx = []
				for (let i = 0; i < n; i++) {
					newx[i] = kout[i].concat()
					newx[i][j] += ds
					newx[i] = newx[i].map(activation)
				}
				const pj = this.outputLayers(newx, k + 1)
				const oj = pj[pj.length - 1]
				let ej = 0
				for (let i = 0; i < n; i++) {
					ej += oj[i].reduce((s, v, d) => s + (activation(v) - y[i][d]) ** 2, 0)
				}
				ej /= n

				this._layers[k][j].fit(kin, Array(n).fill(-((e - ej) ** 2 / ds)))
			}
		}

		const lastLayer = this._layers[this._layers.length - 1]
		const p = this.outputLayers(x)
		for (let j = 0; j < lastLayer.length; j++) {
			lastLayer[j].fit(
				p[p.length - 2],
				p[p.length - 1].map((v, i) => y[i][j] - v[j])
			)
		}
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @param {number} from Index of layers to calculate from
	 * @returns {Array<Array<Array<number>>>} Predicted values for each layer
	 */
	outputLayers(data, from = 0) {
		let x = data
		const p = []
		for (let k = from; k < this._layers.length; k++) {
			const xk = Array.from(data, () => [])
			p[k] = Array.from(data, () => [])
			for (let j = 0; j < this._layers[k].length; j++) {
				const [o, z] = this._layers[k][j].output(x)
				for (let i = 0; i < data.length; i++) {
					p[k][i][j] = o[i]
					xk[i][j] = z[i]
				}
			}
			x = xk
		}
		if (this._rule === 1) {
			if (this._logic === 'maj') {
				const xk = []
				for (let i = 0; i < data.length; i++) {
					xk[i] = [x[i].reduce((s, v) => s + v, 0) <= 0 ? -1 : 1]
				}
				p[this._layers.length] = xk
			}
		}
		return p
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {Array<Array<1 | -1>>} Predicted values
	 */
	predict(data) {
		const p = this.outputLayers(data)
		return p[p.length - 1].map(v => v.map(d => (d <= 0 ? -1 : 1)))
	}
}
