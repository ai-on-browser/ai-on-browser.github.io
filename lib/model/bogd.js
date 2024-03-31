/**
 * Bounded Online Gradient Descent
 */
export default class BOGD {
	// Fast Bounded Online Gradient Descent Algorithms
	// https://arxiv.org/abs/1206.4633
	/**
	 * @param {number} [b] Maximum budget size
	 * @param {number} [eta] Stepsize
	 * @param {number} [lambda] Regularization parameter
	 * @param {number} [gamma] Maximum coefficient
	 * @param {'uniform' | 'nonuniform'} [sampling] Sampling approach
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 * @param {'zero_one' | 'hinge'} [loss] Loss type name
	 */
	constructor(
		b = 10,
		eta = 1,
		lambda = 0.1,
		gamma = 0.1,
		sampling = 'nonuniform',
		kernel = 'gaussian',
		loss = 'hinge'
	) {
		this._b = b
		this._eta = eta
		this._lambda = lambda
		this._gamma = gamma
		this._sampling = sampling

		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			switch (kernel.name) {
				case 'gaussian':
					this._s = kernel.s ?? 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = kernel.d ?? 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}

		if (loss === 'zero_one') {
			this._gloss = (t, y) => {
				return t * (y <= 0 ? -1 : 1) <= 0 ? -1 : 0
			}
		} else if (loss === 'hinge') {
			this._gloss = (t, y) => {
				return t * (y <= 0 ? -1 : 1) <= 1 ? -1 : 0
			}
		}

		this._sv = []
		this._alpha = []
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let t = 0; t < x.length; t++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				const sk = this._sv[k]
				s += this._alpha[k] * sk.y * this._kernel(x[t], sk.x)
			}
			const gloss = this._gloss(y[t], s)
			if (gloss === 0) {
				this._alpha = this._alpha.map(v => (1 - this._eta * this._lambda) * v)
			} else if (this._sv.length < this._b) {
				this._alpha = this._alpha.map(v => (1 - this._eta * this._lambda) * v)
				this._alpha.push(-this._eta * gloss)
				this._sv.push({ x: x[t], y: y[t] })
			} else {
				let ik = -1
				const p = []
				if (this._sampling === 'uniform') {
					for (let k = 0; k < this._sv.length; k++) {
						p[k] = 1 / this._sv.length
					}
					ik = Math.floor(Math.random() * this._sv.length)
				} else {
					const ak = []
					for (let k = 0; k < this._sv.length; k++) {
						const sk = this._sv[k]
						ak[k] = this._alpha[k] * Math.sqrt(this._kernel(sk.x, sk.x))
					}
					const s = (this._b - 1) / ak.reduce((s, v) => s + v, 0)
					for (let k = 0; k < this._sv.length; k++) {
						p[k] = 1 - s * ak[k]
					}
					let r = Math.random() * p.reduce((s, v) => s + v, 0)
					for (let k = 0; k < p.length; k++) {
						r -= p[k]
						if (r < 0) {
							ik = k
							break
						}
					}
				}
				const le = this._lambda * this._eta
				for (let k = 0; k < this._sv.length; k++) {
					this._alpha[k] *= (1 - le) / (1 - p[k])
				}
				this._sv.splice(ik, 1)
				this._alpha.splice(ik, 1)
				this._sv.push({ x: x[t], y: y[t] })
				this._alpha.push(-this._eta * gloss)
			}
			for (let k = 0; k < this._sv.length; k++) {
				this._alpha[k] = Math.min(this._alpha[k], this._gamma * this._eta)
			}
		}
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const pred = []
		for (let i = 0; i < data.length; i++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				const sk = this._sv[k]
				s += this._alpha[k] * sk.y * this._kernel(data[i], sk.x)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
