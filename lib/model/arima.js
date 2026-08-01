import Matrix from '../util/matrix.js'

/**
 * AutoRegressive Integrated Moving Average model
 */
export default class ARIMA {
	// https://gri.jp/media/entry/7602
	/**
	 * @param {number} p Order of AR
	 * @param {number} d Degree of differencing
	 * @param {number} q Order of MA
	 */
	constructor(p, d, q) {
		this._p = p
		this._d = d
		this._q = q
		this._rate = 0.1
		this._beta = 1.0e-5

		this._phi = Array(this._p).fill(0)
		this._the = Array(this._q).fill(0.3)
	}

	_diff(data) {
		let y = data
		const lastValues = [y[y.length - 1]]
		for (let t = 0; t < this._d; t++) {
			const ny = []
			for (let i = 0; i < y.length - 1; i++) {
				ny[i] = y[i + 1] - y[i]
			}
			y = ny
			lastValues.push(y[y.length - 1])
		}
		return [y, lastValues.slice(0, -1)]
	}

	_integrate(data, lastValues) {
		let c = data
		for (let t = lastValues.length - 1; t >= 0; t--) {
			const integrated = []
			let acc = lastValues[t]
			for (let i = 0; i < data.length; i++) {
				acc += data[i]
				integrated.push(acc)
			}
			c = integrated
		}
		return c
	}

	/**
	 * Fit model.
	 * @param {number[]} data Training data
	 */
	fit(data) {
		const [y] = this._diff(data)
		const n = y.length

		const pq_max = Math.max(this._p, this._q)

		for (let k = 0; k < 1; k++) {
			this._u = [y[0]]
			for (let i = 1; i < n; i++) {
				let v = y[i]
				for (let j = 0; j < Math.min(i, this._p); j++) {
					v -= this._phi[j] * y[i - j - 1]
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					v += this._the[j] * this._u[i - j - 1]
				}
				this._u[i] = v
			}
			let J = Matrix.zeros(n, this._p + this._q)
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < Math.min(i, this._p); j++) {
					J.set(i, j, -y[i - j - 1])
				}
				for (let j = 0; j < Math.min(i, this._q); j++) {
					J.set(i, j + this._p, this._u[i - j - 1])
				}
			}
			J = J.slice(pq_max)
			const f = new Matrix(n - pq_max, 1, this._u.slice(pq_max))

			const H = J.tDot(J)
			H.add(Matrix.eye(H.rows, H.cols, this._beta))
			const d = H.solve(J.tDot(f)).value
			let e = d.reduce((s, v) => s + Math.abs(v), 0)
			e /= this._phi.reduce((s, v) => s + Math.abs(v), 0) + this._the.reduce((s, v) => s + Math.abs(v), 0)
			if (Number.isNaN(e) || e < 1.0e-12) break

			for (let i = 0; i < this._p; i++) {
				this._phi[i] -= this._rate * d[i]
			}
			for (let i = 0; i < this._q; i++) {
				this._the[i] -= this._rate * d[i + this._p]
			}
		}
	}

	/**
	 * Returns predicted future values.
	 * @param {number[]} data Sample data
	 * @param {number} k Prediction count
	 * @returns {number[]} Predicted values
	 */
	predict(data, k) {
		const [y, lastValues] = this._diff(data)
		const preds = []
		const lasts = y.slice(y.length - Math.max(this._p, this._q))
		lasts.reverse()
		for (let t = 0; t < k; t++) {
			let pred = 0
			for (let i = 0; i < this._p; i++) {
				pred += this._phi[i] * lasts[i]
			}
			pred += this._u[this._u.length - 1]
			for (let i = 0; i < this._q; i++) {
				pred -= this._u[this._u.length - i - 2] * this._the[i]
			}
			preds.push(pred)
			lasts.unshift(pred)
			lasts.pop()
		}
		return this._integrate(preds, lastValues)
	}
}
