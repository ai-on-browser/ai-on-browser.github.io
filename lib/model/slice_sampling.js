/**
 * slice sampling
 */
export default class SliceSampling {
	// https://en.wikipedia.org/wiki/Slice_sampling
	/**
	 * @param {function (number[]): number} targetFunc Target distribution
	 * @param {number} d Output size
	 * @param {number} [w] Check width
	 */
	constructor(targetFunc, d, w = 1.0) {
		this._f = targetFunc
		this._d = d
		this._w = w
	}

	/**
	 * Returns sampled values.
	 * @param {number} n Number of generated data
	 * @returns {Array<Array<number>>} Generated values
	 */
	sample(n) {
		return this._sample_hyperrectangle(n)
	}

	_sample_hyperrectangle(n) {
		let x = Array(this._d).fill(0)

		const samples = []

		while (samples.length < n) {
			const p = this._f(x)
			const u = Math.random() * p

			const rmin = x.map(v => v - this._w)
			for (let k = 0; this._f(rmin) >= u && k < 100; k++) {
				for (let i = 0; i < this._d; i++) {
					rmin[i] -= this._w
				}
			}
			const rmax = x.map(v => v + this._w)
			for (let k = 0; this._f(rmax) >= u && k < 100; k++) {
				for (let i = 0; i < this._d; i++) {
					rmax[i] += this._w
				}
			}

			const xi = []
			for (let i = 0; i < this._d; i++) {
				xi[i] = rmin[i] + Math.random() * (rmax[i] - rmin[i])
			}
			while (this._f(xi) < u) {
				for (let i = 0; i < this._d; i++) {
					if (xi[i] < x[i]) {
						rmin[i] = xi[i]
					} else {
						rmax[i] = xi[i]
					}
					xi[i] = rmin[i] + Math.random() * (rmax[i] - rmin[i])
				}
			}
			samples.push(xi)
			x = xi
		}
		return samples
	}
}
