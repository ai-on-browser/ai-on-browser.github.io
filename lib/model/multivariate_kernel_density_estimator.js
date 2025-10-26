import Matrix from '../util/matrix.js'

/**
 * Multivariate kernel density estimator
 */
export default class MultivariateKernelDensityEstimator {
	// https://en.wikipedia.org/wiki/Multivariate_kernel_density_estimation
	/**
	 * @param {'silverman' | 'scott'} [method] Optimal bandwidth method
	 */
	constructor(method = 'silverman') {
		this._method = method
	}

	_kernel(invh, sqrtdeth, x) {
		const d = x.cols
		const k = x.dot(invh)
		k.mult(x)
		const ks = k.sum(1)
		ks.map(v => Math.exp(-v / 2) / ((2 * Math.PI) ** (d / 2) * sqrtdeth))

		return ks
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 */
	fit(x) {
		this._x = Matrix.fromArray(x)

		const n = x.length
		const d = x[0].length
		if (this._method === 'pi') {
			throw new Error('Not implemented')
		} else if (this._method === 'scv') {
			throw new Error('Not implemented')
		} else if (this._method === 'silverman') {
			const std = this._x.std(0).value
			this._h = Matrix.zeros(d, d)
			const s = (4 / (d + 2)) ** (1 / (d + 4)) / n ** (1 / (d + 4))
			for (let i = 0; i < d; i++) {
				this._h.set(i, i, (std[i] * s) ** 2)
			}
		} else if (this._method === 'scott') {
			const std = this._x.std(0).value
			this._h = Matrix.zeros(d, d)
			const s = 1 / n ** (1 / (d + 4))
			for (let i = 0; i < d; i++) {
				this._h.set(i, i, (std[i] * s) ** 2)
			}
		}

		this._invh = this._h.inv()
		this._hsqrtdet = Math.sqrt(this._h.det())
	}

	/**
	 * Returns probabilities of the datas.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	probability(x) {
		return x.map(v => {
			const xi = new Matrix(1, v.length, v)
			xi.isub(this._x)

			return this._kernel(this._invh, this._hsqrtdet, xi).mean()
		})
	}

	/**
	 * Returns probabilities of the datas.
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {number[]} Predicted values
	 */
	predict(x) {
		return this.probability(x)
	}
}
