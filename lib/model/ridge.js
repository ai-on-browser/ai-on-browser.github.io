import { Matrix } from '../util/math.js'

export class Ridge {
	constructor(lambda = 0.1) {
		this._w = null
		this._lambda = lambda
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xtx = x.tDot(x)
		for (let i = 0; i < xtx.rows; i++) {
			xtx.addAt(i, i, this._lambda)
		}

		this._w = xtx.solve(x.t).dot(y)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).toArray()
	}

	importance() {
		return this._w.value
	}
}

export class KernelRidge {
	constructor(lambda = 0.1, kernel = null) {
		this._w = null
		this._x = null
		this._lambda = lambda
		this._kernel = null
		if (kernel === 'gaussian') {
			this._kernel = (x, y, sigma = 1.0) => {
				const s = x.copySub(y).reduce((acc, v) => acc + v * v, 0)
				return Math.exp(-s / sigma ** 2)
			}
		}
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const K = new Matrix(x.rows, x.rows)
		this._x = []
		for (let i = 0; i < x.rows; i++) {
			this._x.push(x.row(i))
			K.set(i, i, this._kernel(this._x[i], this._x[i]) + this._lambda)
			for (let j = 0; j < i; j++) {
				const v = this._kernel(this._x[i], this._x[j])
				K.set(i, j, v)
				K.set(j, i, v)
			}
		}
		this._w = K.solve(y)
	}

	predict(x) {
		x = Matrix.fromArray(x)
		const K = new Matrix(x.rows, this._x.length)
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i)
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel(xi, this._x[j])
				K.set(i, j, v)
			}
		}
		return K.dot(this._w).toArray()
	}

	importance() {
		return this._w.value
	}
}
