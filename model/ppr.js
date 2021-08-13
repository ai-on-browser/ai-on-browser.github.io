class GaussianFunction {
	constructor(m = 0, s = 1, a = 1) {
		this._m = m
		this._s = s
		this._a = a
	}

	calc(v) {
		return this._a * Math.exp(-((v - this._m) ** 2) / (2 * this._s))
	}

	update(vs, d) {
		const da = vs.copyMap(v => this.calc(v) / this._a)
		da.mult(d)
		this._a += da.mean()

		const ds = vs.copyMap(v => this.calc(v) * ((v - this._m) ** 2 / (2 * this._s ** 2)))
		ds.mult(d)
		this._s += ds.mean()

		const dm = vs.copyMap(v => this.calc(v) * (v - this._m))
		dm.mult(d)
		this._m += dm.mean()
	}

	grad(v) {
		return this.calc(v) * (this._m - v)
	}
}

export default class ProjectionPursuit {
	// https://en.wikipedia.org/wiki/Projection_pursuit_regression
	constructor(r = 5) {
		this._r = r
		this._w = null
		this._f = []
		for (let i = 0; i < r; i++) {
			this._f[i] = new GaussianFunction()
		}
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const n = x.rows
		const xh = x.resize(n, x.cols + 1, 1)

		if (this._w === null) {
			this._w = []
			for (let i = 0; i < this._r; i++) {
				this._w[i] = Matrix.randn(xh.cols, 1)
			}
		}

		const pv = new Matrix(n, this._r)
		const pf = new Matrix(n, this._r)
		for (let k = 0; k < this._r; k++) {
			const v = xh.dot(this._w[k])
			pv.set(0, k, v)
			pf.set(
				0,
				k,
				v.copyMap(v => this._f[k].calc(v))
			)
		}

		for (let k = 0; k < this._r; k++) {
			const diff = y.copySub(pf.sum(1))
			this._f[k].update(pv.col(k), diff)

			const w = new Matrix(n, 1)
			const b = new Matrix(n, 1)
			for (let i = 0; i < n; i++) {
				const v = pv.at(i, k)
				w.set(i, 0, this._f[k].grad(v) ** 2)
				b.set(i, 0, v + diff.at(i, 0) / this._f[k].grad(v))
			}

			const xtw = xh.copyMult(w)
			this._w[k] = xtw.tDot(xh).slove(xtw.tDot(b))

			const v = xh.dot(this._w[k])
			pv.set(0, k, v)
			pf.set(
				0,
				k,
				v.copyMap(v => this._f[k].calc(v))
			)
		}
	}

	predict(x) {
		x = Matrix.fromArray(x)
		let xh = x.resize(x.rows, x.cols + 1, 1)

		const pf = new Matrix(xh.rows, this._r)
		for (let k = 0; k < this._r; k++) {
			const v = xh.dot(this._w[k])
			pf.set(
				0,
				k,
				v.copyMap(v => this._f[k].calc(v))
			)
		}
		return pf.sum(1).toArray()
	}
}
