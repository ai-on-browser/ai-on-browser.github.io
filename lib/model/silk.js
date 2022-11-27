/**
 * Implicit online Learning with Kernels
 */
export class ILK {
	// Implicit Online Learning with Kernels
	// https://proceedings.neurips.cc/paper/2006/file/a92c274b8be496fb05d95033552eeddd-Paper.pdf
	/**
	 * @param {number} [eta=1] Learning rate
	 * @param {number} [lambda=1] Regularization constant
	 * @param {number} [c=1] Penalty imposed on point prediction violations.
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 * @param {'square' | 'hinge' | 'logistic'} [loss=hinge] Loss type name
	 */
	constructor(eta = 1, lambda = 1, c = 1, kernel = 'gaussian', loss = 'hinge') {
		this._eta = eta
		this._lambda = lambda
		this._c = c
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			switch (kernel) {
				case 'gaussian':
					this._s = 1
					this._kernel = (a, b) =>
						Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / this._s ** 2)
					break
				case 'polynomial':
					this._d = 2
					this._kernel = (a, b) => (1 + a.reduce((s, v, i) => s + v * b[i])) ** this._d
					break
			}
		}
		if (loss === 'square') {
			this._loss = (f, k, y) => {
				const tau = (this._eta * this._lambda) / (1 + this._eta * this._lambda)
				return (this._c * (1 - tau) * (y - (1 - tau) * f)) / (1 + this._c * (1 - tau) * k)
			}
		} else if (loss === 'hinge') {
			this._rho = 1
			this._loss = (f, k, y) => {
				const tau = (this._eta * this._lambda) / (1 + this._eta * this._lambda)
				const ahat = (y * (this._rho - (1 - tau) * y * f)) / k
				if (y * ahat < 0) {
					return 0
				} else if (y * ahat > (1 - tau) * this._c) {
					return y * (1 - tau) * this._c
				}
				return ahat
			}
		} else if (loss === 'graph') {
			throw new Error('Not implemented.')
		} else if (loss === 'logistic') {
			this._loss = (f, k, y) => {
				const fn = a => {
					const tau = (this._eta * this._lambda) / (1 + this._eta * this._lambda)
					return ((1 - tau) * this._c * y) / (1 + Math.exp(y * (1 - tau) * f + a * y * k)) - a
				}
				let ap = [0, fn(0)]
				let an = [y * this._c, fn(y * this._c)]
				while (an[0] - ap[0] >= 1.0e-8) {
					const ma = (an[0] + ap[0]) / 2
					const mf = fn(ma)
					if (mf === 0) {
						return ma
					} else if (ap[1] * mf > 0) {
						ap = [ma, mf]
					} else {
						an = [ma, mf]
					}
				}
				return (an[0] + ap[0]) / 2
			}
		}

		this._sv = []
		this._a = []
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		let s = 0
		for (let k = 0; k < this._sv.length; k++) {
			s += this._a[k] * this._kernel(x, this._sv[k])
		}
		const k = this._kernel(x, x)
		const at = this._loss(s, k, y)
		const tau = (this._eta * this._lambda) / (1 + this._eta * this._lambda)
		for (let k = 0; k < this._a.length; k++) {
			this._a[k] *= 1 - tau
		}
		if (at === 0) {
			return
		}
		this._sv.push(x)
		this._a.push(at)
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let t = 0; t < x.length; t++) {
			this.update(x[t], y[t])
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
				s += this._a[k] * this._kernel(data[i], this._sv[k])
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}

/**
 * Sparse Implicit online Learning with Kernels
 */
export class SILK extends ILK {
	/**
	 * @param {number} [eta=1] Learning rate
	 * @param {number} [lambda=1] Regularization constant
	 * @param {number} [c=1] Penalty imposed on point prediction violations.
	 * @param {number} [w=10] Buffer size
	 * @param {'gaussian' | 'polynomial' | function (number[], number[]): number} [kernel=gaussian] Kernel name
	 * @param {'square' | 'hinge' | 'graph' | 'logistic'} [loss=hinge] Loss type name
	 */
	constructor(eta = 1, lambda = 1, c = 1, w = 10, kernel = 'gaussian', loss = 'hinge') {
		super(eta, lambda, c, kernel, loss)
		this._w = w
	}

	/**
	 * Update model parameters with one data.
	 *
	 * @param {number[]} x Training data
	 * @param {1 | -1} y Target value
	 */
	update(x, y) {
		super.update(x, y)
		if (this._sv.length > this._w) {
			let mina = Infinity
			let mink = -1
			for (let k = 0; k < this._sv.length; k++) {
				if (Math.abs(this._a[k]) < mina) {
					mina = Math.abs(this._a[k])
					mink = k
				}
			}
			this._a.splice(mink, 1)
			this._sv.splice(mink, 1)
		}
	}
}
