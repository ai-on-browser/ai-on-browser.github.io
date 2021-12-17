import { Matrix } from '../util/math.js'

/**
 * Gaussian mixture model
 */
export class GMM {
	// see https://www.slideshare.net/TakayukiYagi1/em-66114496
	// Anomaly detection https://towardsdatascience.com/understanding-anomaly-detection-in-python-using-gaussian-mixture-model-e26e5d06094b
	//                   A Survey of Outlier Detection Methodologies. (2004)
	constructor() {
		this._k = 0
		this._d = null
		this._p = []
		this._m = []
		this._s = []
	}

	_init(datas) {
		if (!this._d) {
			this._d = datas[0].length
			for (let i = 0; i < this._k; i++) {
				this.add()
				this._k--
			}
		}
	}

	/**
	 * Add a new cluster.
	 */
	add() {
		this._k++
		if (this._d) {
			this._p.push(Math.random())
			this._m.push(Matrix.random(this._d, 1))
			const s = Matrix.randn(this._d, this._d)
			this._s.push(s.tDot(s))
		}
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		this._k = 0
		this._p = []
		this._m = []
		this._s = []
	}

	/**
	 * Returns probabilities.
	 * @param {Array<Array<number>>} data
	 * @returns {Array<Array<number>>}
	 */
	probability(data) {
		this._init(data)
		return data.map(v => {
			const x = new Matrix(this._d, 1, v)
			const prob = []
			for (let i = 0; i < this._k; i++) {
				const v = this._gaussian(x, this._m[i], this._s[i]) * this._p[i]
				prob.push(v)
			}
			return prob
		})
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data
	 * @returns {number[]}
	 */
	predict(data) {
		this._init(data)
		return data.map(v => {
			const x = new Matrix(this._d, 1, v)
			let max_p = 0
			let max_c = -1
			for (let i = 0; i < this._k; i++) {
				let v = this._gaussian(x, this._m[i], this._s[i])
				if (v > max_p) {
					max_p = v
					max_c = i
				}
			}
			return max_c
		})
	}

	_gaussian(x, m, s) {
		const xs = x.copySub(m)
		return (
			Math.exp(-0.5 * xs.tDot(s.inv()).dot(xs).toScaler()) /
			(Math.sqrt(2 * Math.PI) ** this._d * Math.sqrt(s.det()))
		)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas
	 */
	fit(datas) {
		this._init(datas)
		const n = datas.length
		const g = []
		const N = Array(this._k).fill(0)
		const x = []
		datas.forEach((data, i) => {
			const ns = []
			let s = 0
			const xi = new Matrix(this._d, 1, data)
			for (let j = 0; j < this._k; j++) {
				const v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j]
				ns.push(v || 0)
				s += v || 0
			}
			const gi = ns.map(v => v / (s || 1.0))
			g.push(gi)
			x.push(xi)
			gi.forEach((v, j) => (N[j] += v))
		})

		for (let i = 0; i < this._k; i++) {
			const new_mi = new Matrix(this._d, 1)
			for (let j = 0; j < n; j++) {
				new_mi.add(x[j].copyMult(g[j][i]))
			}
			new_mi.div(N[i])
			this._m[i] = new_mi

			const new_si = new Matrix(this._d, this._d)
			for (let j = 0; j < n; j++) {
				let tt = x[j].copySub(new_mi)
				tt = tt.dot(tt.t)
				tt.mult(g[j][i])
				new_si.add(tt)
			}
			new_si.div(N[i])
			new_si.add(Matrix.eye(this._d, this._d, 1.0e-8))
			this._s[i] = new_si

			this._p[i] = N[i] / n
		}
	}
}

/**
 * Semi-Supervised gaussian mixture model
 */
export class SemiSupervisedGMM extends GMM {
	// http://yamaguchiyuto.hatenablog.com/entry/machine-learning-advent-calendar-2014
	constructor() {
		super()
	}

	/**
	 * Categories
	 * @type {*[]}
	 */
	get categories() {
		return this._classes
	}

	/**
	 * Initialize model.
	 * @param {Array<Array<number>>} datas
	 * @param {(* | null)[]} labels
	 */
	init(datas, labels) {
		this.clear()
		this._init(datas)
		this._classes = [...new Set(labels.filter(v => v != null))]
		for (let k = 0; k < this._classes.length; k++) {
			super.add()
		}
	}

	add() {}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} datas
	 * @param {(* | null)[]} y
	 */
	fit(datas, y) {
		this._init(datas)
		const n = datas.length
		const g = []
		const N = Array(this._k).fill(0)
		const x = []
		datas.forEach((data, i) => {
			const ns = []
			let s = 0
			const xi = new Matrix(this._d, 1, data)
			for (let j = 0; j < this._k; j++) {
				const cidx = this._classes.indexOf(y[i])
				let v = 0
				if (cidx < 0) {
					v = this._gaussian(xi, this._m[j], this._s[j]) * this._p[j]
				} else {
					v = cidx === j ? 1 : 0
				}
				ns.push(v || 0)
				s += v || 0
			}
			const gi = ns.map(v => v / (s || 1.0))
			g.push(gi)
			x.push(xi)
			gi.forEach((v, j) => (N[j] += v))
		})

		for (let i = 0; i < this._k; i++) {
			const new_mi = new Matrix(this._d, 1)
			for (let j = 0; j < n; j++) {
				new_mi.add(x[j].copyMult(g[j][i]))
			}
			new_mi.div(N[i])
			this._m[i] = new_mi

			const new_si = new Matrix(this._d, this._d)
			for (let j = 0; j < n; j++) {
				let tt = x[j].copySub(new_mi)
				tt = tt.dot(tt.t)
				tt.mult(g[j][i])
				new_si.add(tt)
			}
			new_si.div(N[i])
			new_si.add(Matrix.eye(this._d, this._d, 1.0e-8))
			this._s[i] = new_si

			this._p[i] = N[i] / n
		}
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data
	 * @returns {*[]}
	 */
	predict(data) {
		return super.predict(data).map(v => this._classes[v])
	}
}

/**
 * Gaussian mixture regression
 */
export class GMR extends GMM {
	// https://datachemeng.com/gaussianmixtureregression/
	constructor() {
		super()
		this._input_d = 0
		this._mx = []
		this._my = []
		this._sxx = []
		this._sxy = []
	}

	/**
	 * Add a new cluster.
	 */
	add() {
		super.add()
		if (this._mx.length < this._m.length) {
			for (let i = this._mx.length; i < this._m.length; i++) {
				this._mx[i] = this._m[i].slice(0, this._input_d)
				this._my[i] = this._m[i].slice(this._input_d)
				this._sxx[i] = this._s[i].block(0, 0, this._input_d, this._input_d)
				this._sxy[i] = this._s[i].block(this._input_d, 0, null, this._input_d)
			}
		}
	}

	/**
	 * Clear all clusters.
	 */
	clear() {
		super.clear()
		this._mx = []
		this._my = []
		this._sxx = []
		this._sxy = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 */
	fit(x, y) {
		this._input_d = x[0].length
		const datas = x.map((v, i) => v.concat(y[i]))
		super.fit(datas)

		this._mx = this._m.map(m => m.slice(0, this._input_d))
		this._my = this._m.map(m => m.slice(this._input_d))
		this._sxx = this._s.map(m => m.block(0, 0, this._input_d, this._input_d))
		this._sxy = this._s.map(m => m.block(0, this._input_d, this._input_d, null))
	}

	/**
	 * Returns probabilities.
	 * @param {Array<Array<number>>} x
	 * @param {Array<Array<number>>} y
	 * @returns {Array<Array<number>>}
	 */
	probability(x, y) {
		const datas = x.map((v, i) => v.concat(y[i]))
		return super.probability(datas)
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x
	 * @returns {Array<Array<number>>}
	 */
	predict(x) {
		if (this._mx.length === 0) {
			return []
		}
		x = Matrix.fromArray(x)
		const w = new Matrix(x.rows, this._k)
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i).t
			for (let k = 0; k < this._k; k++) {
				const v = this._gaussian(xi, this._mx[k], this._sxx[k]) * this._p[k]
				w.set(i, k, v)
			}
		}
		w.div(w.sum(1))

		const ys = new Matrix(x.rows, this._my[0].cols)
		for (let k = 0; k < this._k; k++) {
			const c = x.copySub(this._mx[k].t).dot(this._sxx[k].inv()).dot(this._sxy[k])
			c.add(this._my[k])
			c.mult(w.col(k))
			ys.add(c)
		}
		return ys.toArray()
	}
}
