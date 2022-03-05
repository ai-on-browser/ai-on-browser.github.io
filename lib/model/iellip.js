import Matrix from '../util/matrix.js'

/**
 * Classical ellipsoid method
 */
export class CELLIP {
	// https://icml.cc/Conferences/2009/papers/472.pdf
	// Online Learning by Ellipsoid Method.
	/**
	 * @param {number} [gamma=0.1]
	 * @param {number} [a=0.5]
	 */
	constructor(gamma = 0.1, a = 0.5) {
		this._m = null
		this._s = null
		this._gamma = gamma
		this._a = a
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._p = Matrix.eye(this._d, this._d, 1 + (1 - this._a) * this._gamma)
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {Matrix} x
	 * @param {1 | -1} y
	 */
	update(x, y) {
		const m = this._m.tDot(x).toScaler()
		if (m * y > 0) return

		const v = Math.sqrt(x.tDot(this._p).dot(x).toScaler())
		const alpha = (this._a * this._gamma - y * m) / v
		const g = Matrix.mult(x, y / v)
		const dm = this._p.dot(g)
		dm.mult(alpha)
		this._m.add(dm)

		const p = this._p.dot(g).dot(g.tDot(this._p))
		p.mult(-2 * alpha * (1 - this._a))
		p.add(Matrix.mult(this._p, 1 - alpha ** 2))
		this._p = p
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._m)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}

/**
 * Improved ellipsoid method
 */
export class IELLIP {
	// https://icml.cc/Conferences/2009/papers/472.pdf
	// Online Learning by Ellipsoid Method.
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.html
	// https://github.com/LIBOL/LIBOL/blob/master/algorithms/IELLIP.m
	/**
	 * @param {number} [b=0.9]
	 * @param {number} [c=0.5]
	 */
	constructor(b = 0.9, c = 0.5) {
		this._m = null
		this._p = null
		this._b = b
		this._c = c
	}

	/**
	 * Initialize this model.
	 *
	 * @param {Array<Array<number>>} train_x
	 * @param {Array<1 | -1>} train_y
	 */
	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._p = Matrix.eye(this._d, this._d)

		this._t = 0
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {Matrix} x
	 * @param {1 | -1} y
	 */
	update(x, y) {
		const m = this._m.tDot(x).toScaler()
		if (m * y > 0) return

		const v = Math.sqrt(x.tDot(this._p).dot(x).toScaler())
		const alpha = (1 - y * m) / v
		const g = Matrix.mult(x, y / v)
		const ct = this._c * this._b ** this._t++

		const dm = this._p.dot(g)
		dm.mult(alpha)
		this._m.add(dm)

		const p = this._p.dot(g).dot(g.tDot(this._p))
		p.mult(-ct)
		p.add(this._p)
		p.mult(1 / (1 - ct))
		this._p = p
	}

	/**
	 * Fit model parameters.
	 */
	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	/**
	 * Returns predicted datas.
	 *
	 * @param {Array<Array<number>>} data
	 * @returns {(1 | -1)[]}
	 */
	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._m)
		return r.value.map(v => (v <= 0 ? -1 : 1))
	}
}
