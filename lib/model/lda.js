import { Matrix } from '../util/math.js'

/**
 * Linear discriminant analysis
 */
export class LinearDiscriminant {
	// http://alice.info.kogakuin.ac.jp/public_data/2013/J110033b.pdf
	constructor() {
		this._x = null
		this._y = null
		this._w = null
		this._w0 = null
	}

	_s(x) {
		x.map(v => 1 / (1 + Math.exp(-v)))
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		const x = Matrix.fromArray(this._x)
		const x0 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === 1))
		const x1 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === -1))
		const m0 = x0.mean(0)
		const m1 = x1.mean(0)
		const s = x.cov()
		const sinv = s.inv()

		this._w = m0.copySub(m1).dot(sinv).t
		this._w0 =
			-m0.dot(sinv).dot(m0.t).toScaler() / 2 + m1.dot(sinv).dot(m1.t).toScaler() / 2 + Math.log(x0.rows / x1.rows)
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const r = x.dot(this._w)
		r.add(this._w0)
		this._s(r)
		r.sub(0.5)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}

/**
 * Fishers linear discriminant analysis
 */
export class FishersLinearDiscriminant {
	constructor() {
		this._x = null
		this._y = null
		this._w = null
		this._m = null
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = train_x
		this._y = train_y
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		const x0 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === 1))
		const x1 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === -1))
		const m0 = x0.mean(0)
		const m1 = x1.mean(0)
		x0.sub(m0)
		x1.sub(m1)

		const Sw = x0.tDot(x0)
		Sw.add(x1.tDot(x1))
		this._w = m0.copySub(m1).dot(Sw.inv()).t
		this._m = Matrix.fromArray(this._x).mean(0)
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._m)
		return x.dot(this._w).value.map(v => (v <= 0 ? -1 : 1))
	}
}

/**
 * Multiclass linear discriminant analysis
 */
export class MulticlassLinearDiscriminant {
	// http://www.personal.psu.edu/jol2/course/stat597e/notes2/mda.pdf
	// https://en.wikipedia.org/wiki/Linear_discriminant_analysis#Multiclass_LDA
	constructor() {}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x
	 * @param {*[]} y
	 */
	fit(x, y) {
		const d = x[0].length
		this._c = [...new Set(y)]
		this._a = []
		this._m = []
		this._s = Matrix.zeros(d, d)
		for (let i = 0; i < this._c.length; i++) {
			let xi = x.filter((v, k) => y[k] === this._c[i])
			this._a[i] = xi.length / x.length
			xi = Matrix.fromArray(xi)
			this._m[i] = xi.mean(0)
			xi.sub(this._m[i])
			this._s.add(xi.tDot(xi))
		}
		this._s.div(x.length)
		this._sinv = this._s.inv()
	}

	/**
	 * Returns predicted categories.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {*[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const p = new Matrix(x.rows, this._c.length)
		for (let i = 0; i < this._c.length; i++) {
			const xi = x.copySub(this._m[i])
			const v = xi.dot(this._sinv)
			v.mult(xi)
			const s = v.sum(1)
			s.map(v => Math.exp(-v / 2) * this._a[i])
			p.set(0, i, s)
		}
		return p.argmax(1).value.map(v => this._c[v])
	}
}

/**
 * Returns reduced values by linear discriminant analysis.
 *
 * @function
 * @param {Array<Array<number>>} x
 * @param {number[]} t
 * @param {number} rd
 * @returns {Array<Array<number>>}
 */
export const LinearDiscriminantAnalysis = function (x, t, rd = 0) {
	// https://axa.biopapyrus.jp/machine-learning/preprocessing/lda.html
	x = Matrix.fromArray(x)
	const d = x.cols
	const n = x.rows
	let c = {}
	let cn = 0
	for (let i = 0; i < n; i++) {
		if (c[t[i]] === undefined) c[t[i]] = cn++
		t[i] = c[t[i]]
	}

	const mean = x.mean(0).value
	let cmean = []
	for (let i = 0; i < cn; cmean[i++] = Array(d).fill(0));
	let cnum = Array(cn).fill(0)
	for (let k = 0; k < n; k++) {
		cnum[t[k]]++
		for (let j = 0; j < d; j++) {
			cmean[t[k]][j] += x.at(k, j)
		}
	}
	for (let i = 0; i < cn; i++) {
		for (let j = 0; j < d; j++) {
			cmean[i][j] /= cnum[i]
		}
	}

	let w = []
	for (let i = 0; i < d; w[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0
			for (let k = 0; k < n; k++) {
				v += (x.at(k, i) - cmean[t[k]][i]) * (x.at(k, j) - cmean[t[k]][j])
			}
			w[i][j] = w[j][i] = v / n
		}
	}
	w = new Matrix(d, d, w)

	let b = []
	for (let i = 0; i < d; b[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0
			for (let k = 0; k < cn; k++) {
				v += (cmean[k][i] - mean[i]) * (cmean[k][j] - mean[j]) * cnum[k]
			}
			b[i][j] = b[j][i] = v / n
		}
	}
	b = new Matrix(d, d, b)

	let cov = w.solve(b)
	let ev = cov.eigenVectors()
	if (rd > 0 && rd < ev.cols) {
		ev = ev.resize(ev.rows, rd)
	}
	return x.dot(ev).toArray()
}
