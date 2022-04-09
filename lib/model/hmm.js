import Matrix from '../util/matrix.js'

/**
 * Hidden Markov model
 */
class HMMBase {
	/**
	 * @param {number} n Number of states
	 */
	constructor(n) {
		this._n = n

		this._a = Matrix.random(this._n, this._n)
		this._a.div(this._a.sum(1))
		this._p = new Matrix(1, this._n, 1 / this._n)
	}

	_bt(x, t) {
		throw 'Not implemented'
	}

	_forward(x, scaled = false) {
		let a = this._p.copy()
		const c = scaled && new Matrix(x.rows, x.cols)
		a.repeat(x.rows, 0)
		a.mult(this._bt(x, 0))
		if (c) {
			c.set(0, 0, a.sum(1))
			a.div(c.col(0))
		}
		const as = [a.copy()]
		for (let t = 1; t < x.cols; t++) {
			a = a.dot(this._a)
			a.mult(this._bt(x, t))
			if (c) {
				c.set(0, t, a.sum(1))
				a.div(c.col(t))
			}
			as.push(a.copy())
		}
		if (c) {
			return [as, c]
		}
		return as
	}

	_backward(x, c = null, prob = false) {
		let b = Matrix.ones(x.rows, this._n)
		const bs = [b.copy()]
		for (let t = x.cols - 1; t > 0; t--) {
			b.mult(this._bt(x, t))
			b = b.dot(this._a.t)
			if (c) {
				b.div(c.col(t))
			}
			bs.unshift(b.copy())
		}
		if (prob) {
			b.mult(this._bt(x, 0))
			b.mult(this._p)
		}
		return bs
	}

	_gamma(alpha, beta) {
		const gamma = []
		const an = alpha[alpha.length - 1].sum(1)
		for (let t = 0; t < alpha.length; t++) {
			const g = Matrix.mult(alpha[t], beta[t])
			g.div(an)
			gamma.push(g)
		}
		return gamma
	}

	_xi(x, alpha, beta, c) {
		const xi = []
		const an = alpha[alpha.length - 1].sum(1)
		for (let t = 0; t < alpha.length - 1; t++) {
			xi[t] = []
			const bt = this._bt(x, t + 1)
			for (let k = 0; k < x.rows; k++) {
				const a = alpha[t].row(k).t
				const b = beta[t + 1].row(k)
				b.mult(bt.row(k))
				const z = this._a.copy()
				z.mult(a)
				z.mult(b)
				if (c) {
					z.div(c.at(k, t + 1))
				} else {
					z.div(an.value[k])
				}
				xi[t].push(z)
			}
		}
		return xi
	}

	_update(gamma, xi) {
		const n = gamma[0].rows
		const ah = Matrix.zeros(this._n, this._n)
		const gsum = Matrix.zeros(n, this._n)
		for (let t = 0; t < gamma.length - 1; t++) {
			gsum.add(gamma[t])
		}
		gsum.add(1.0e-12)
		for (let k = 0; k < n; k++) {
			const zk = Matrix.zeros(this._n, this._n)
			for (let t = 0; t < xi.length; t++) {
				zk.add(xi[t][k])
			}
			zk.div(gsum.row(k).t)
			ah.add(zk)
		}
		ah.div(n)

		const ph = gamma[0].mean(0)

		this._a = ah
		this._p = ph
	}

	/**
	 * Returns probability of the datas.
	 *
	 * @param {Matrix} x Sample data
	 * @returns {Matrix} Predicted values
	 */
	probability(x) {
		const alpha = this._forward(x)

		return alpha[alpha.length - 1].sum(1)
	}

	/**
	 * Returns best path of the datas.
	 *
	 * @param {Matrix} x Sample data
	 * @returns {Matrix} Predicted path
	 */
	bestPath(x) {
		const path = new Matrix(x.rows, x.cols)
		const a = this._p.copy()
		a.repeat(x.rows, 0)
		a.mult(this._bt(x, 0))
		path.set(0, 0, a.argmax(1))

		for (let t = 1; t < x.cols; t++) {
			for (let k = 0; k < x.rows; k++) {
				const p = path.at(k, t - 1)
				const ak = this._a.row(p)
				ak.mult(a.at(k, p))
				a.set(k, 0, ak)
			}
			a.mult(this._bt(x, t))
			path.set(0, t, a.argmax(1))
		}
		return path
	}
}

/**
 * Hidden Markov model
 */
export class HMM extends HMMBase {
	// https://qiita.com/ta-ka/items/3e5306d0432c05909992
	// https://mieruca-ai.com/ai/viterbi_algorithm/
	/**
	 * @param {number} n Number of states
	 */
	constructor(n) {
		super(n)

		this._b = null
		this._x_cand = []
		this._type = 'mealy'
	}

	_bt(x, t) {
		const b = new Matrix(x.rows, this._n)
		for (let i = 0; i < x.rows; i++) {
			const idx = this._x_cand.indexOf(x.at(i, t))
			b.set(i, 0, this._b.col(idx).t)
		}
		return b
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<*>>} datas Training data
	 * @param {boolean} scaled Do scaled calculation or not
	 */
	fit(datas, scaled = false) {
		const x = Matrix.fromArray(datas)
		if (this._b === null) {
			this._x_cand = [...new Set(x.value)]
			this._b = new Matrix(this._n, this._x_cand.length, 1 / this._x_cand.length)
		}
		const n = x.rows
		let alpha, c
		if (scaled) {
			;[alpha, c] = this._forward(x, true)
		} else {
			alpha = this._forward(x)
		}
		const beta = this._backward(x, c)

		const gamma = this._gamma(alpha, beta)
		const xi = this._xi(x, alpha, beta, c)

		this._update(gamma, xi)

		const gsum = Matrix.zeros(n, this._n)
		for (let t = 0; t < gamma.length; t++) {
			gsum.add(gamma[t])
		}

		const bh = Matrix.zeros(this._n, this._b.cols)
		for (let k = 0; k < n; k++) {
			const dk = Matrix.zeros(this._n, this._b.cols)
			for (let t = 0; t < x.cols; t++) {
				for (let i = 0; i < this._n; i++) {
					dk.addAt(i, this._x_cand.indexOf(x.at(k, t)), gamma[t].at(k, i))
				}
			}
			dk.div(gsum.row(k).t)
			bh.add(dk)
		}
		bh.div(n)

		this._b = bh
	}

	/**
	 * Returns probability of the datas.
	 *
	 * @param {Array<Array<*>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(datas) {
		const x = Matrix.fromArray(datas)
		return super.probability(x).value
	}

	/**
	 * Returns best path of the datas.
	 *
	 * @param {Array<Array<*>>} data Sample data
	 * @returns {Array<Array<number>>} Predicted path
	 */
	bestPath(data) {
		const x = Matrix.fromArray(data)
		return super.bestPath(x).toArray()
	}
}

/**
 * Continuous hidden Markov model
 */
export class ContinuousHMM extends HMMBase {
	// https://library.naist.jp/mylimedio/dllimedio/showpdf2.cgi/DLPDFR001283_P1
	// http://unicorn.ike.tottori-u.ac.jp/murakami/doctor/node16.html
	/**
	 * @param {number} n Number of states
	 * @param {number} d Number of data dimensions
	 */
	constructor(n, d) {
		super(n)
		this._k = 3
		this._d = d

		this._c = new Matrix(this._n, this._k, 1 / this._k)
		this._m = []
		this._s = []
		for (let i = 0; i < this._n; i++) {
			this._m[i] = Matrix.zeros(this._k, this._d)
			this._s[i] = []
			for (let j = 0; j < this._k; j++) {
				this._s[i][j] = Matrix.eye(this._d, this._d)
			}
		}
	}

	_btk(o, t, k) {
		o = Matrix.fromArray(o.col(t).value)
		const b = new Matrix(o.rows, this._n)
		for (let n = 0; n < this._n; n++) {
			const m = this._m[n]
			const s = this._s[n]

			const bn = Matrix.zeros(o.rows, 1)
			const cx = Matrix.sub(o, m.row(k))
			const tx = cx.dot(s[k].inv())
			tx.mult(cx)

			const v = tx.sum(1)
			const d = Math.sqrt((2 * Math.PI) ** this._d * s[k].det())
			v.map(a => (Math.exp(-a / 2) / d) * this._c.at(n, k))
			bn.add(v)

			b.set(0, n, bn)
		}
		return b
	}

	_bt(o, t) {
		const b = new Matrix(o.rows, this._n)
		for (let k = 0; k < this._k; k++) {
			b.add(this._btk(o, t, k))
		}
		return b
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<Array<number>>>} x Training data
	 * @param {boolean} scaled Do scaled calculation or not
	 */
	fit(x, scaled = false) {
		x = Matrix.fromArray(x)
		let alpha, c
		if (scaled) {
			;[alpha, c] = this._forward(x, true)
		} else {
			alpha = this._forward(x)
		}
		const beta = this._backward(x, c)

		const gamma = this._gamma(alpha, beta)
		const xi = this._xi(x, alpha, beta, c)

		this._update(gamma, xi)

		const gk = []
		const gksum = Matrix.zeros(x.rows, this._n)
		const gksum_t = []
		const b = []
		for (let i = 0; i < gamma.length; i++) {
			b[i] = this._bt(x, i)
		}
		for (let k = 0; k < this._k; k++) {
			gk[k] = []
			gksum_t[k] = Matrix.zeros(x.rows, this._n)
			for (let i = 0; i < gamma.length; i++) {
				const bk = this._btk(x, i, k)
				bk.div(b[i])
				bk.mult(gamma[i])
				gk[k][i] = bk
				gksum.add(bk)
				gksum_t[k].add(bk)
			}
		}

		const ch = new Matrix(this._n, this._k)
		for (let k = 0; k < this._k; k++) {
			ch.set(0, k, Matrix.div(gksum_t[k], gksum).mean(0).t)
		}

		const xt = []
		for (let i = 0; i < x.cols; i++) {
			xt[i] = Matrix.fromArray(x.col(i).value)
		}
		const mh = []
		const sh = []
		for (let n = 0; n < this._n; n++) {
			const mhn = new Matrix(this._k, this._d)
			const shn = []
			for (let k = 0; k < this._k; k++) {
				const mhnk = Matrix.zeros(x.rows, this._d)

				for (let t = 0; t < x.cols; t++) {
					mhnk.add(Matrix.mult(xt[t], gk[k][t].col(n)))
				}
				mhnk.div(gksum_t[k].col(n))
				mhn.set(k, 0, mhnk.mean(0))

				const shnk = Matrix.zeros(this._d, this._d)
				for (let i = 0; i < x.rows; i++) {
					const shnki = Matrix.zeros(this._d, this._d)
					for (let t = 0; t < x.cols; t++) {
						const xt_s = Matrix.sub(xt[t].row(i), this._m[n].row(k))
						const si = xt_s.tDot(xt_s)
						si.mult(gk[k][t].at(i, n))
						shnki.add(si)
					}
					shnki.div(gksum_t[k].at(i, n))
					shnk.add(shnki)
				}
				shnk.div(x.rows)
				shn[k] = shnk
			}
			mh[n] = mhn
			sh[n] = shn
		}

		this._c = ch
		this._m = mh
		this._s = sh
	}

	/**
	 * Returns probability of the datas.
	 *
	 * @param {Array<Array<Array<number>>>} datas Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(datas) {
		const x = Matrix.fromArray(datas)
		return super.probability(x).value
	}

	/**
	 * Returns best path of the datas.
	 *
	 * @param {Array<Array<Array<number>>>} data Sample data
	 * @returns {Array<Array<number>>} Predicted path
	 */
	bestPath(data) {
		const x = Matrix.fromArray(data)
		return super.bestPath(x).toArray()
	}

	/**
	 * Returns generated values.
	 *
	 * @param {number} n Number of generated data
	 * @param {number} length Path length
	 * @returns {Array<Array<Array<number>>>} Generated values
	 */
	generate(n = 1, length = 5) {
		const randIdx = (m, row) => {
			let r = Math.random()
			let k = 0
			for (; k < m.cols - 1; k++) {
				if ((r -= m.at(row, k)) <= 0) {
					break
				}
			}
			return k
		}
		const v = []
		for (let i = 0; i < n; i++) {
			v[i] = []
			let k = randIdx(this._p, 0)
			let c = randIdx(this._c, k)

			v[i][0] = Matrix.randn(1, this._d, this._m[k].row(c), this._s[k][c]).value

			for (let t = 1; t < length; t++) {
				k = randIdx(this._a, k)
				c = randIdx(this._c, k)

				v[i][t] = Matrix.randn(1, this._d, this._m[k].row(c), this._s[k][c]).value
			}
		}
		return v
	}
}

/**
 * Hidden Markov model classifier
 */
export class HMMClassifier {
	/**
	 *
	 * @param {number[]} classes Initial class labels
	 * @param {number} states Number of states
	 * @param {*} cls HMM class
	 */
	constructor(classes, states, cls = ContinuousHMM) {
		this._classes = [...classes]
		this._models = []
		for (let i = 0; i < this._classes.length; i++) {
			const m = new cls(states, 1)
			this._models.push(m)
		}
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<Array<number>>>} x Training data
	 * @param {*[]} y Target values
	 * @param {boolean} scaled Do scaled calculation or not
	 */
	fit(x, y, scaled = false) {
		for (let i = 0; i < this._models.length; i++) {
			const xi = x.filter((v, j) => this._classes[i] === y[j])
			this._models[i].fit(xi, scaled)
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<Array<number>>>} x Sample data
	 * @returns {(* | null)[]} Predicted values
	 */
	predict(x) {
		const pred = []
		for (const model of this._models) {
			pred.push(model.probability(x))
		}

		const pm = Matrix.fromArray(pred)
		const p = pm.argmax(0)
		const ps = pm.max(0)
		p.map((v, i) => (ps.at(i) > 0 ? this._classes[v] : null))
		return p.value
	}
}
