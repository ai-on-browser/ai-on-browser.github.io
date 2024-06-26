import Matrix from '../util/matrix.js'

/**
 * Probabilistic Principal component analysis
 */
export default class ProbabilisticPCA {
	// https://qiita.com/amber_kshz/items/e47fa606863aa97c7bd7
	// https://qiita.com/ctgk/items/89c11192affe7f236852
	// http://www.cs.columbia.edu/~blei/seminar/2020-representation/readings/TippingBishop1999.pdf
	/**
	 * @param {'analysis' | 'em' | 'bayes'} [method] Method name
	 * @param {number} rd Reduced dimension
	 */
	constructor(method = 'analysis', rd) {
		this._method = method
		this._rd = rd
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		x = Matrix.fromArray(x)
		if (this._method === 'analysis') {
			this._analysis(x)
		} else if (this._method === 'em') {
			this._em(x)
		} else if (this._method === 'bayes') {
			this._bayes(x)
		}
	}

	_analysis(x) {
		this._m = x.mean(0)

		const s = x.cov()
		const [eigvalues, eigvectors] = s.eigen()

		this._sigma = 0
		for (let i = this._rd; i < eigvalues.length; i++) {
			this._sigma += eigvalues[i] / (eigvalues.length - this._rd)
		}

		const l = eigvalues.slice(0, this._rd).map(v => Math.sqrt(v - this._sigma))

		this._w = eigvectors.slice(0, this._rd, 1).dot(Matrix.diag(l))
	}

	_em(x) {
		if (!this._w) {
			this._w = Matrix.eye(x.cols, this._rd)
			this._sigma = 0
			this._m = x.mean(0)
		}
		x = Matrix.sub(x, this._m)

		const m = this._w.tDot(this._w)
		m.add(Matrix.eye(this._rd, this._rd, this._sigma))
		const minv = m.inv()

		const ez = x.dot(this._w).dot(minv.t)
		const ezz = Matrix.mult(minv, this._sigma * x.rows)
		ezz.add(ez.tDot(ez))

		this._w = x.tDot(ez).dot(ezz.inv())
		this._sigma =
			(Matrix.mult(x, x).sum() -
				2 * Matrix.mult(ez, x.dot(this._w)).sum() +
				Matrix.mult(ezz, this._w.tDot(this._w).t).sum()) /
			(x.rows * x.cols)
	}

	_bayes(x) {
		if (!this._w) {
			this._w = Matrix.eye(x.cols, this._rd)
			this._sigma = 0
			this._m = x.mean(0)
			this._alpha = Matrix.ones(1, this._rd).value
		}
		x = Matrix.sub(x, this._m)

		const m = this._w.tDot(this._w)
		m.add(Matrix.eye(this._rd, this._rd, this._sigma))
		const minv = m.inv()

		const ez = x.dot(this._w).dot(minv.t)
		const ezz = Matrix.mult(minv, this._sigma * x.rows)
		ezz.add(ez.tDot(ez))

		const a = Matrix.diag(this._alpha)
		a.mult(this._sigma)

		this._w = x.tDot(ez).dot(Matrix.add(ezz, a).inv())
		this._sigma =
			(Matrix.mult(x, x).sum() -
				2 * Matrix.mult(ez, x.dot(this._w)).sum() +
				Matrix.mult(ezz, this._w.tDot(this._w).t).sum()) /
			(x.rows * x.cols)
		this._alpha = Matrix.mult(this._w, this._w)
			.sum(0)
			.value.map(v => x.cols / v)
	}

	/**
	 * Returns reduced datas.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x) {
		x = Matrix.fromArray(x)
		x.sub(this._m)

		const m = this._w.tDot(this._w)
		const d = this._w.cols
		m.add(Matrix.eye(d, d, this._sigma))
		return x.dot(this._w).dot(m.inv()).toArray()
	}
}
