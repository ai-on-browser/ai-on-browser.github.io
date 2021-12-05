const normal_random = function (m = 0, s = 1) {
	const std = Math.sqrt(s)
	const x = Math.random()
	const y = Math.random()
	const X = Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * y)
	return X * std + m
}

/**
 * Metropolis-Hastings algorithm
 */
export default class MetropolisHastings {
	// https://ja.wikipedia.org/wiki/%E3%83%A1%E3%83%88%E3%83%AD%E3%83%9D%E3%83%AA%E3%82%B9%E3%83%BB%E3%83%98%E3%82%A4%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%82%B9%E6%B3%95
	// https://qiita.com/takilog/items/b03bfe54f12e70600194
	/**
	 * @param {function (number[]): number} targetFunc
	 * @param {number} d
	 * @param {'gaussian'} q
	 */
	constructor(targetFunc, d, q = 'gaussian') {
		this._f = targetFunc
		this._d = d
		if (q === 'gaussian') {
			this._q = (x, y) => Math.exp(-x.reduce((s, v, i) => s + (v - y[i]) ** 2, 0) / 2)
		}
	}

	/**
	 * Returns sampled values.
	 * @param {number} n
	 * @param {number} [t=100]
	 * @returns {Array<Array<number>>}
	 */
	sample(n, t = 100) {
		let x = Array(this._d).fill(1)
		let m = 0
		let s = 1

		const samples = []

		while (samples.length < n) {
			for (let i = 0; i < t; i++) {
				const xi = x.concat()
				for (let d = 0; d < xi.length; d++) {
					xi[d] += normal_random(m, s)
				}
				const a1 = this._f(xi) / this._f(x)
				const a2 = this._q(x, xi) / this._q(xi, x)
				const a = a1 * a2

				if (Math.random() < a) {
					x = xi
				}
			}
			samples.push(x)
		}
		return samples
	}
}
