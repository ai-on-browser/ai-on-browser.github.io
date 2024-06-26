import Matrix from '../util/matrix.js'

/**
 * Mixture discriminant analysis
 */
export default class MixtureDiscriminant {
	// http://www.personal.psu.edu/jol2/course/stat597e/notes2/mda.pdf
	/**
	 * @param {number} r Number of components
	 */
	constructor(r) {
		this._r = r
	}

	/**
	 * Initialize this model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {*[]} y Target values
	 */
	init(x, y) {
		this._x = x
		this._y = y

		this._d = this._x[0].length
		this._c = [...new Set(y)]
		this._p = Matrix.random(this._x.length, this._r)
		this._p.div(this._p.sum(1))

		this._a = []
		for (let i = 0; i < this._c.length; i++) {
			const xi = this._x.filter((v, k) => this._y[k] === this._c[i])
			this._a[i] = xi.length / this._x.length
		}

		this._mstep()
	}

	_mstep() {
		this._pi = Matrix.zeros(this._c.length, this._r)
		this._m = []
		for (let i = 0; i < this._c.length; i++) {
			this._m[i] = Matrix.zeros(this._r, this._d)
		}

		const count = Matrix.zeros(this._c.length, 1)
		const psum = []
		for (let i = 0; i < this._c.length; i++) {
			psum[i] = Matrix.zeros(1, this._r)
		}
		for (let i = 0; i < this._x.length; i++) {
			const cidx = this._c.indexOf(this._y[i])
			for (let r = 0; r < this._r; r++) {
				const pir = this._p.at(i, r)
				this._pi.addAt(cidx, r, pir)
				for (let d = 0; d < this._d; d++) {
					this._m[cidx].addAt(r, d, this._x[i][d] * pir)
				}
			}
			count.addAt(cidx, 0, 1)
			psum[cidx].add(this._p.row(i))
		}
		this._pi.div(count)
		for (let i = 0; i < this._c.length; i++) {
			this._m[i].div(psum[i].t)
		}

		this._s = Matrix.zeros(this._d, this._d)
		const yidx = this._y.map((v, i) => [v, i])
		for (let i = 0; i < this._c.length; i++) {
			let xi = this._x.filter((v, k) => this._y[k] === this._c[i])
			xi = Matrix.fromArray(xi)
			const pi = this._p.row(yidx.filter(v => v[0] === this._c[i]).map(v => v[1]))
			for (let r = 0; r < this._r; r++) {
				const xir = Matrix.sub(xi, this._m[i].row(r))
				const v = xir.tDot(Matrix.mult(xir, pi.col(r)))
				this._s.add(v)
			}
		}
		this._s.div(this._x.length)
		this._sinv = this._s.inv()
	}

	/**
	 * Fit model.
	 */
	fit() {
		this._p = Matrix.zeros(this._x.length, this._r)
		for (let i = 0; i < this._x.length; i++) {
			const cidx = this._c.indexOf(this._y[i])
			const x = new Matrix(1, this._d, this._x[i])
			for (let r = 0; r < this._r; r++) {
				const xir = Matrix.sub(x, this._m[cidx].row(r))
				const v = xir.dot(this._sinv).dot(xir.t).toScaler()
				this._p.addAt(i, r, this._pi.at(cidx, r) * Math.exp(-v / 2))
			}
		}
		this._p.div(this._p.sum(1))

		this._mstep()
	}

	/**
	 * Returns predicted categories.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		const p = Matrix.zeros(x.rows, this._c.length)
		for (let i = 0; i < this._c.length; i++) {
			for (let r = 0; r < this._r; r++) {
				const xi = Matrix.sub(x, this._m[i].row(r))
				const v = xi.dot(this._sinv)
				v.mult(xi)
				const s = v.sum(1)
				s.map(v => this._pi.at(i, r) * Math.exp(-v / 2))
				for (let n = 0; n < x.rows; n++) {
					p.addAt(n, i, this._a[i] * s.at(n, 0))
				}
			}
		}
		return p.argmax(1).value.map(v => this._c[v])
	}
}
