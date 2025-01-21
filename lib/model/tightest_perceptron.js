const logGamma = z => {
	// https://en.wikipedia.org/wiki/Lanczos_approximation
	// https://slpr.sakura.ne.jp/qp/gamma-function/
	let x = 0
	if (Number.isInteger(z)) {
		for (let i = 2; i < z; i++) {
			x += Math.log(i)
		}
	} else if (Number.isInteger(z - 0.5)) {
		const n = z - 0.5
		x = Math.log(Math.sqrt(Math.PI)) - Math.log(2) * n
		for (let i = 2 * n - 1; i > 0; i -= 2) {
			x += Math.log(i)
		}
	} else if (z < 0.5) {
		x = Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z)
	} else {
		const p = [
			676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
			-0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
		]
		z -= 1
		x = 0.99999999999980993
		for (let i = 0; i < p.length; i++) {
			x += p[i] / (z + i + 1)
		}
		const t = z + p.length - 0.5
		x = Math.log(Math.sqrt(2 * Math.PI)) + Math.log(t) * (z + 0.5) - t + Math.log(x)
	}
	return x
}

const logBeta = (p, q) => {
	// https://www2.math.kyushu-u.ac.jp/~snii/AdvancedCalculus/7-1.pdf
	return logGamma(p) + logGamma(q) - logGamma(p + q)
}

const hypergeometric = (a, b, c, z) => {
	// https://qiita.com/moriokumura/items/e35025d4ade312b0a017
	let f = 1
	let p = 0
	const lnz = Math.log(z)
	for (let n = 0; n < 1000; n++) {
		p = p + lnz + Math.log(a + n) + Math.log(b + n) - Math.log(c + n) - Math.log(1 + n)
		const ep = Math.exp(p)
		f += ep
		if (Math.abs(ep / f) < 1.0e-14) {
			break
		}
	}
	return f
}

const logIncompleteBeta = (z, a, b) => {
	// https://ja.wikipedia.org/wiki/%E4%B8%8D%E5%AE%8C%E5%85%A8%E3%83%99%E3%83%BC%E3%82%BF%E9%96%A2%E6%95%B0
	// https://math-functions-1.watson.jp/sub1_spec_050.html#section030
	// https://qiita.com/moriokumura/items/e35025d4ade312b0a017
	if (b === 1) {
		return Math.log(z) * a - Math.log(a)
	} else if (a === 1) {
		return Math.log(1 - (1 - z) ** b) - Math.log(b)
	} else if (a === 0.5 && b === 0) {
		return Math.log(2 * Math.atanh(Math.sqrt(z)))
	} else if (a === 0.5 && b === 0.5) {
		return Math.log(2 * Math.asin(Math.sqrt(z)))
	} else if (Number.isInteger(b)) {
		const za = z ** a
		let ib = za / a
		for (let i = 1; i < b; i++) {
			ib = (i * ib + za * (1 - z) ** i) / (a + i)
		}
		return Math.log(ib)
	} else if (Number.isInteger(a)) {
		const zb = (1 - z) ** b
		let ib = (1 - zb) / b
		for (let i = 1; i < a; i++) {
			ib = (i * ib - z ** i * zb) / (i + b)
		}
		return Math.log(ib)
	}
	if (a < b) {
		return Math.log(Math.exp(logBeta(a, b)) - Math.exp(logIncompleteBeta(1 - z, b, a)))
	}
	return Math.log(z) * a - Math.log(a) + b * Math.log(1 - z) + Math.log(hypergeometric(a + b, 1, a + 1, z))
}

const regularizedIncompleteBeta = (z, a, b) => {
	// beta distribution of the first kind
	if (z === 0) {
		return 0
	} else if (z === 1) {
		return 1
	} else if (b === 1) {
		return z ** a
	} else if (a === 1) {
		return 1 - (1 - z) ** b
	}
	if (a < b) {
		return 1 - regularizedIncompleteBeta(1 - z, b, a)
	}
	return Math.exp(logIncompleteBeta(z, a, b) - logBeta(a, b))
}

const kernels = {
	gaussian:
		({ s = 1 }) =>
		(a, b) =>
			Math.exp(-(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2) / s ** 2),
	polynomial:
		({ d = 2 }) =>
		(a, b) =>
			(1 + a.reduce((s, v, i) => s + v * b[i], 0)) ** d,
}

/**
 * Tightest Perceptron
 */
export default class TightestPerceptron {
	// Online Learning: A Comprehensive Survey
	// https://arxiv.org/abs/1802.02871
	// Tighter perceptron with improved dual use of cached data for model representation and validation.
	// https://www.dabi.temple.edu/external/vucetic/documents/wang09ijcnn.pdf
	/**
	 * @param {number} [b] Budget size
	 * @param {'gaussian' | 'polynomial' | { name: 'gaussian', s?: number } | { name: 'polynomial', d?: number } | function (number[], number[]): number} [kernel] Kernel name
	 * @param {'zero_one' | 'hinge'} [accuracyLoss] Accuracy loss type name
	 */
	constructor(b = 10, kernel = 'gaussian', accuracyLoss = 'hinge') {
		this._b = b

		if (typeof kernel === 'function') {
			this._kernel = kernel
		} else {
			if (typeof kernel === 'string') {
				kernel = { name: kernel }
			}
			this._kernel = kernels[kernel.name](kernel)
		}

		if (accuracyLoss === 'hinge') {
			this._accuracyLossP = y => {
				return Math.max(0, 1 - y)
			}
			this._accuracyLossN = y => {
				return Math.max(0, 1 + y)
			}
		} else {
			this._accuracyLossP = y => {
				return y < 0 ? 1 : 0
			}
			this._accuracyLossN = y => {
				return y < 0 ? 0 : 1
			}
		}
		this._ap = 1
		this._an = 1

		this._sv = []
	}

	/**
	 * Fit model parameters.
	 * @param {Array<Array<number>>} x Training data
	 * @param {Array<1 | -1>} y Target values
	 */
	fit(x, y) {
		for (let i = 0; i < x.length; i++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				const sk = this._sv[k]
				s += sk.y * this._kernel(x[i], sk.x)
			}
			if (s * y[i] <= 0) {
				if (y[i] === 1) {
					this._sv.push({ x: x[i], y: y[i], cp: 1, cn: 0 })
				} else {
					this._sv.push({ x: x[i], y: y[i], cp: 0, cn: 1 })
				}
				if (this._sv.length > this._b) {
					let min_l = Infinity
					let min_r = -1
					for (let k = 0; k < this._sv.length; k++) {
						let loss = 0
						for (let j = 0; j < this._sv.length; j++) {
							let f = 0
							for (let m = 0; m < this._sv.length; m++) {
								if (m === k) {
									continue
								}
								const sk = this._sv[m]
								f += sk.y * this._kernel(this._sv[j].x, sk.x)
							}
							const lp = this._accuracyLossP(f)
							const ln = this._accuracyLossN(f)
							const wp =
								1 - regularizedIncompleteBeta(0.5, this._sv[j].cp + this._ap, this._sv[j].cn + this._an)
							loss += wp * lp + (1 - wp) * ln
						}
						loss /= this._sv.length
						if (loss < min_l) {
							min_l = loss
							min_r = k
						}
					}
					const sv = this._sv.splice(min_r, 1)[0]
					this._updateSummary(sv.x, sv.cp, sv.cn)
				}
			} else {
				if (y[i] === 1) {
					this._updateSummary(x[i], 1, 0)
				} else {
					this._updateSummary(x[i], 0, 1)
				}
			}
		}
	}

	_updateSummary(x, cp, cn) {
		if (this._sv.length === 0) {
			return
		}
		let min_d = Infinity
		let min_k = -1
		for (let i = 0; i < this._sv.length; i++) {
			const d = this._sv[i].x.reduce((s, v, d) => s + (v - x[d]) ** 2, 0)
			if (d < min_d) {
				min_d = d
				min_k = i
			}
		}
		const kn = this._kernel(x, this._sv[min_k].x)
		this._sv[min_k].cp += cp * kn
		this._sv[min_k].cn += cn * kn
	}

	/**
	 * Returns predicted values.
	 * @param {Array<Array<number>>} data Sample data
	 * @returns {(1 | -1)[]} Predicted values
	 */
	predict(data) {
		const p = []
		for (let i = 0; i < data.length; i++) {
			let s = 0
			for (let k = 0; k < this._sv.length; k++) {
				const sk = this._sv[k]
				s += sk.y * this._kernel(data[i], sk.x)
			}
			p[i] = s < 0 ? -1 : 1
		}
		return p
	}
}
