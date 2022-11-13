import Matrix from '../util/matrix.js'

/**
 * Diffusion map
 */
export default class DiffusionMap {
	// https://en.wikipedia.org/wiki/Diffusion_map
	// https://inside.mines.edu/~whereman/papers/delaPorte-Herbst-Hereman-vanderWalt-PRASA-2008.pdf
	/**
	 * @param {number} t Power parameter
	 * @param {'gaussian' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 */
	constructor(t, kernel = 'gaussian') {
		this._t = t
		if (typeof kernel === 'function') {
			this._k = kernel
		} else if (kernel === 'gaussian') {
			this._k = (x, y) => Math.exp(-x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / 2)
		}
	}

	/**
	 * Returns reduced values.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {number} rd Reduced dimension
	 * @returns {Array<Array<number>>} Predicted values
	 */
	predict(x, rd) {
		const n = x.length
		const p = new Matrix(n, n)
		for (let i = 0; i < n; i++) {
			for (let j = i; j < n; j++) {
				const k = this._k(x[i], x[j])
				p.set(i, j, k)
				p.set(j, i, k)
			}
		}
		p.div(p.sum(1))

		const pt = p.power(this._t)

		const [eigvalue, eigvector] = pt.eigen()

		const y = eigvector.slice(0, rd, 1)
		const l = new Matrix(1, rd, eigvalue.slice(0, rd))
		l.map(v => v ** this._t)
		y.mult(l)

		return y.toArray()
	}
}
