import Matrix from '../util/matrix.js'

/**
 * Least absolute shrinkage and selection operator
 */
export default class Lasso {
	// see http://satopirka.com/2017/10/lasso%E3%81%AE%E7%90%86%E8%AB%96%E3%81%A8%E5%AE%9F%E8%A3%85--%E3%82%B9%E3%83%91%E3%83%BC%E3%82%B9%E3%81%AA%E8%A7%A3%E3%81%AE%E6%8E%A8%E5%AE%9A%E3%82%A2%E3%83%AB%E3%82%B4%E3%83%AA%E3%82%BA%E3%83%A0-/
	// see https://qiita.com/fujiisoup/items/f2fe3b508763b0cc6832
	// https://leck-tech.com/machine-learning/lars
	// https://satopirka.com/2021/01/lars-lasso/
	/**
	 * @param {number} [lambda] Regularization strength
	 * @param {'CD' | 'ISTA' | 'LARS'} [method] Method name
	 */
	constructor(lambda = 0.1, method = 'CD') {
		this._w = null
		this._lambda = lambda
		this._method = method
	}

	_soft_thresholding(x, l) {
		x.map(v => (v < -l ? v + l : v > l ? v - l : 0))
	}

	_calc_b0(x, y) {
		let wei = this._w.copy()
		for (let j = 0; j < wei.cols; j++) {
			wei.set(wei.rows - 1, j, 0)
		}
		let xw = x.dot(wei)
		xw.isub(y)
		let b0 = xw.sum(0)
		b0.div(x.rows)
		this._w.set(this._w.rows - 1, 0, b0)
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<Array<number>>} y Target values
	 */
	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		if (!this._w) {
			this._w = Matrix.randn(x.cols, y.cols)
		}
		if (this._method === 'ISTA') {
			this._ista(x, y)
		} else if (this._method === 'CD') {
			this._cd(x, y)
		} else if (this._method === 'LARS') {
			this._lars(x, y)
		}
		//this._calc_b0(x, y);
	}

	_ista(x, y) {
		let xx = x.tDot(x)
		xx.map(v => Math.abs(v))
		xx = xx.sum(0)
		let mx = Math.max.apply(null, xx.value)
		const L = mx / this._lambda
		let new_w = x.dot(this._w)
		new_w.isub(y)
		new_w = x.tDot(new_w)
		new_w.div(this._lambda * L)

		this._w.add(new_w)
		this._soft_thresholding(this._w, 1 / L)
	}

	_cd(x, y) {
		for (let i = 0; i < this._w.rows; i++) {
			let xi = x.col(i)
			let wei = this._w.copy()
			for (let j = 0; j < this._w.cols; j++) {
				wei.set(i, j, 0)
			}
			wei = x.dot(wei)
			wei.isub(y)

			let d = xi.tDot(wei)
			this._soft_thresholding(d, this._lambda)
			d.div(xi.tDot(xi))

			this._w.set(i, 0, d)
		}
	}

	_lars(x, y) {
		const as = []
		const ias = Array.from({ length: x.cols }, (_, i) => i)
		const m = Matrix.zeros(x.rows, this._w.cols)

		const beta = Matrix.zeros(this._w.rows, this._w.cols)
		let change_sign_flag = false
		let k = 0
		while (ias.length > 0) {
			let j = null
			const c = x.tDot(Matrix.sub(y, m))
			if (!change_sign_flag) {
				j = ias[Matrix.map(c.row(ias), Math.abs).argmax(0).toScaler()]
				as.push(j)
				ias.splice(ias.indexOf(j), 1)
			}
			const C = Matrix.map(c, Math.abs).argmax(0).toScaler()

			const s = Matrix.map(c.row(as), Math.sign)
			const xa = Matrix.mult(x.col(as), s.t)

			const ga = xa.tDot(xa)
			const ga_inv = ga.inv()

			const aa = 1 / Math.sqrt(ga_inv.sum())

			const w = ga_inv.sum(1)
			w.mult(aa)
			const u = xa.dot(w)

			const a = x.tDot(u)
			const d = Matrix.mult(s, w)

			let gamma = C / aa
			if (k < x.cols - 1) {
				const gc = Matrix.zeros(ias.length, 2)
				for (let k = 0; k < ias.length; k++) {
					gc.set(k, 0, (C - c.at(ias[k], 0)) / (aa - a.at(ias[k], 0)))
					gc.set(k, 1, (C + c.at(ias[k], 0)) / (aa + a.at(ias[k], 0)))
				}
				gamma = Matrix.map(gc, v => (v <= 0 ? Infinity : v)).min()
			}

			const gc_tilde = beta.row(as)
			gc_tilde.div(d)
			gc_tilde.mult(-1)
			gc_tilde.map(v => (v <= 0 ? Infinity : v))
			const g_tilde = gc_tilde.min()

			change_sign_flag = false
			if (g_tilde < gamma) {
				gamma = g_tilde
				j = as[gc_tilde.argmin(0).toScaler()]
				change_sign_flag = true
			}

			const new_beta = beta.row(as)
			new_beta.add(Matrix.mult(d, gamma))
			const idx = j !== 0 ? 0 : 1
			const tbeta = Matrix.zeros(this._w.rows, this._w.cols)
			for (let k = 0; k < as.length; k++) {
				tbeta.set(as[k], 0, new_beta.at(k, 0))
			}

			const lmb =
				(Math.abs(
					x
						.col(idx)
						.tDot(Matrix.sub(y, x.dot(tbeta)))
						.toScaler()
				) *
					2) /
				x.rows

			if (lmb < this._lambda) {
				const pl =
					(Math.abs(
						x
							.col(idx)
							.tDot(Matrix.sub(y, x.dot(this._w)))
							.toScaler()
					) *
						2) /
					x.rows
				if (as.length < 2 && pl < this._lambda) break
				const mod_gamma = (gamma * (this._lambda - pl)) / (lmb - pl)
				for (let k = 0; k < as.length; k++) {
					beta[as[k]] += d.at(k, 0) * mod_gamma
				}
				m.add(Matrix.mult(u, mod_gamma))
				this._w = beta.copy()
				break
			}

			m.add(Matrix.mult(u, gamma))
			for (let k = 0; k < as.length; k++) {
				beta.addAt(as[k], 0, new_beta.at(k, 0))
			}
			this._w = beta.copy()

			if (change_sign_flag) {
				as.splice(as.indexOf(j), 1)
				ias.push(j)
			}
			k = as.length
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		return x.dot(this._w).toArray()
	}

	/**
	 * Returns importances of the features.
	 * @returns {number[]} Importances
	 */
	importance() {
		return this._w.value
	}
}
