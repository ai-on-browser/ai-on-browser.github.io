import { Matrix } from '../util/math.js'

const nelderMead = (w1, f, lambda = 1, alpha = 1, gamma = 2, rho = 0.5, sigma = 0.5, iteration = null) => {
	// https://ja.wikipedia.org/wiki/%E3%83%8D%E3%83%AB%E3%83%80%E3%83%BC%E2%80%93%E3%83%9F%E3%83%BC%E3%83%89%E6%B3%95
	const d = w1.length
	const w = [w1.copy()]
	for (let i = 0; i < d; i++) {
		const e = Matrix.zeros(w1.rows, w1.cols)
		e.value[i] = lambda
		e.add(w1)
		w.push(e)
	}
	if (!iteration) {
		iteration = d * 5
	}

	const fw = w.map(v => [f(v), v])
	for (let k = 0; k < iteration; k++) {
		fw.sort((a, b) => a[0] - b[0])
		if (fw[0][0] === 0) break
		const w0 = fw[0][1].copy()
		for (let i = 1; i < d; i++) {
			w0.add(fw[i][1])
		}
		w0.div(d)

		const wr = w0.copy()
		wr.sub(fw[d][1])
		wr.mult(alpha)
		wr.add(w0)

		const fwr = f(wr)
		if (fw[0][0] <= fwr && fwr < fw[d - 1][0]) {
			fw[d] = [fwr, wr]
		} else if (fwr < fw[0][0]) {
			const we = wr.copy()
			we.sub(w0)
			we.mult(gamma)
			we.add(w0)
			const fwe = f(we)
			if (fwe < fwr) {
				fw[d] = [fwe, we]
			} else {
				fw[d] = [fwr, wr]
			}
		} else {
			const wc = fw[d][1].copy()
			wc.sub(w0)
			wc.mult(rho)
			wc.add(w0)
			const fwc = f(wc)
			if (fwc < fw[d][0]) {
				fw[d] = [fwc, wc]
			} else {
				for (let i = 1; i <= d; i++) {
					const wt = fw[i][1]
					wt.sub(fw[0][1])
					wt.mult(sigma)
					wt.add(fw[0][1])
					fw[i] = [f(wt), wt]
				}
			}
		}
	}
	fw.sort((a, b) => a[0] - b[0])
	return fw[0][1]
}

/**
 * Probit
 */
export class Probit {
	// https://en.wikipedia.org/wiki/Probit_model
	// https://www-cc.gakushuin.ac.jp/~20130021/ecmr/logit-probit.pdf
	// https://docs.microsoft.com/ja-jp/archive/msdn-magazine/2014/october/test-run-probit-classification-using-csharp
	constructor() {
		this._w = null
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		const x = Matrix.fromArray(train_x)
		this._x = x.resize(x.rows, x.cols + 1, 1)
		this._y = train_y

		this._d = this._x.cols
		this._w = Matrix.randn(this._d, 1)
	}

	_cdf(z) {
		const p = 0.3275911
		const a1 = 0.254829592
		const a2 = -0.284496736
		const a3 = 1.421413741
		const a4 = -1.453152027
		const a5 = 1.061405429

		const sign = z < 0 ? -1 : 1
		const x = Math.abs(z) / Math.sqrt(2)
		const t = 1 / (1 + p * x)
		const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
		return 0.5 * (1 + sign * erf)
	}

	_llh(w) {
		const z = Matrix.fromArray(this._x).dot(w)
		z.map(v => this._cdf(v))
		let l = 0
		for (let i = 0; i < z.rows; i++) {
			if (this._y[i] === 1) {
				l += Math.log(z.value[i])
			} else {
				l += Math.log(1 - z.value[i])
			}
		}
		return l
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		this._w = nelderMead(this._w, v => -this._llh(v))
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const y = x.resize(x.rows, x.cols + 1, 1).dot(this._w)
		y.map(v => this._cdf(v) - 0.5)
		return y.value.map(v => (v <= 0 ? -1 : 1))
	}
}

/**
 * Multinomial probit
 */
export class MultinomialProbit extends Probit {
	// https://en.wikipedia.org/wiki/Multinomial_probit
	// http://pareto.uab.es/jllull/Microeconometrics/Class_Notes_Microectrcs_Chapter3.pdf
	constructor() {
		super()
		this._w = null
		this._classes = null
	}

	_llh(w) {
		const z = Matrix.fromArray(this._x).dot(w)
		z.map(v => this._cdf(v))
		z.div(z.sum(1))
		let l = 0
		for (let i = 0; i < z.rows; i++) {
			for (let j = 0; j < this._y.cols; j++) {
				l += this._y.at(i, j) * Math.log(z.at(i, j))
			}
		}
		return l
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {*[]} y
	 */
	fit(x, y) {
		if (!this._classes) {
			this._classes = [...new Set(y)]
		}

		x = Matrix.fromArray(x)
		this._x = x.resize(x.rows, x.cols + 1, 1)
		this._y = new Matrix(x.rows, this._classes.length)
		y.forEach((t, i) => this._y.set(i, this._classes.indexOf(t), 1))

		if (!this._w) {
			this._w = Matrix.randn(this._x.cols, this._classes.length)
		}

		this._w = nelderMead(this._w, v => -this._llh(v))
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data
	 * @returns {*[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const y = x.resize(x.rows, x.cols + 1, 1).dot(this._w)
		y.map(v => this._cdf(v))
		return y.argmax(1).value.map(v => this._classes[v])
	}
}
