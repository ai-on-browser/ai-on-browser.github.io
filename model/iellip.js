export class CELLIP {
	// https://icml.cc/Conferences/2009/papers/472.pdf
	// Online Learning by Ellipsoid Method.
	constructor(gamma = 0.1, a = 0.5) {
		this._m = null
		this._s = null
		this._gamma = gamma
		this._a = a
	}

	init(train_x, train_y) {
		this._x = Matrix.fromArray(train_x)
		this._shift = this._x.mean(0)
		this._x.sub(this._shift)
		this._y = train_y

		this._d = this._x.cols
		this._m = Matrix.zeros(this._d, 1)
		this._p = Matrix.eye(this._d, this._d, 1 + (1 - this._a) * this._gamma)
	}

	update(x, y) {
		const m = this._m.tDot(x).value[0]
		if (m * y > 0) return

		const v = Math.sqrt(x.tDot(this._p).dot(x).value[0])
		const alpha = (this._a * this._gamma - y * m) / v
		const g = x.copyMult(y / v)
		const dm = this._p.dot(g)
		dm.mult(alpha)
		this._m.add(dm)

		const p = this._p.dot(g).dot(g.tDot(this._p))
		p.mult(-2 * alpha * (1 - this._a))
		p.add(this._p.copyMult(1 - alpha ** 2))
		this._p = p
	}

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._m)
		return r.value
	}
}

export class IELLIP {
	// https://icml.cc/Conferences/2009/papers/472.pdf
	// Online Learning by Ellipsoid Method.
	// https://olpy.readthedocs.io/en/latest/modules/olpy.classifiers.html
	// https://github.com/LIBOL/LIBOL/blob/master/algorithms/IELLIP.m
	constructor(b = 0.9, c = 0.5) {
		this._m = null
		this._p = null
		this._b = b
		this._c = c
	}

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

	update(x, y) {
		const m = this._m.tDot(x).value[0]
		if (m * y > 0) return

		const v = Math.sqrt(x.tDot(this._p).dot(x).value[0])
		const alpha = (1 - y * m) / v
		const g = x.copyMult(y / v)
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

	fit() {
		for (let i = 0; i < this._x.rows; i++) {
			this.update(this._x.row(i).t, this._y[i])
		}
	}

	predict(data) {
		const x = Matrix.fromArray(data)
		x.sub(this._shift)
		const r = x.dot(this._m)
		return r.value
	}
}
