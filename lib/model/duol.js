const kernels = {
	gaussian:
		({ s = 1 }) =>
		(a, b) =>
			Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / s ** 2),
	polynomial:
		({ d = 2 }) =>
		(a, b) =>
			(1 + a.reduce((s, v, i) => s + v * b[i])) ** d,
}

/**
 * Double Updating Approach for Online Learning
 */
export default class DUOL {
	// A Double Updating Approach for Online Learning
	// https://proceedings.neurips.cc/paper_files/paper/2009/file/013d407166ec4fa56eb1e1f8cbe183b9-Paper.pdf
	/**
	 * @param {number} [c] Regularization parameter
	 * @param {number} [rho] Threshold
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 */
	constructor(c = 5, rho = 1, kernel = 'gaussian') {
		this._c = c
		this._rho = rho
		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
		}

		this._sv = []
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let t = 0; t < x.length; t++) {
			const xt = x[t]
			const yt = y[t]
			let s = 0
			const kxx = []
			for (let i = 0; i < this._sv.length; i++) {
				const sv = this._sv[i]
				kxx[i] = this._kernel(xt, sv.x)
				s += sv.g * sv.y * kxx[i]
			}
			const lt = Math.max(0, 1 - yt * s)
			if (lt === 0) {
				continue
			}

			let w_min = 0
			let sv_b = null
			for (let i = 0; i < this._sv.length; i++) {
				const sv = this._sv[i]
				if (sv.f > 0) {
					continue
				}
				const v = sv.y * yt * kxx[i]
				if (v < w_min) {
					w_min = v
					sv_b = sv
				}
			}
			this._sv.push({ x: xt, y: yt, f: yt * s, g: 1 })
			kxx.push(this._kernel(xt, xt))

			if (w_min <= -this._rho) {
				const gamma_t = Math.min(this._c, 1 / (1 - this._rho))
				const gamma_b = Math.min(this._c, sv_b.g + 1 / (1 - this._rho))
				for (let i = 0; i < this._sv.length; i++) {
					const sv = this._sv[i]
					sv.f +=
						sv.y * gamma_t * yt * kxx[i] + sv.y * (gamma_b - sv_b.g) * sv_b.y * this._kernel(sv.x, sv_b.x)
				}
				this._sv[this._sv.length - 1].g = gamma_t
				sv_b.g = gamma_b - sv_b.g
			} else {
				const gamma_t = Math.min(this._c, 1)
				for (let i = 0; i < this._sv.length; i++) {
					const sv = this._sv[i]
					sv.f += sv.y * gamma_t * yt * kxx[i]
				}
				this._sv[this._sv.length - 1].g = gamma_t
			}
		}
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const pred = []
		for (let i = 0; i < data.length; i++) {
			let s = 0
			for (const sv of this._sv) {
				s += sv.g * sv.y * this._kernel(data[i], sv.x)
			}
			pred[i] = s < 0 ? -1 : 1
		}
		return pred
	}
}
