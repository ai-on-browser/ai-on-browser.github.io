/**
 * Sezan's thresholding
 */
export default class SezanThresholding {
	// https://qiita.com/yuji0001/items/29c02b4fa1506edbdf19
	/**
	 * @param {number} [gamma] Tradeoff value between black and white
	 * @param {number} [sigma] Sigma of normal distribution
	 */
	constructor(gamma = 0.5, sigma = 5) {
		this._gamma = gamma
		this._sigma = sigma
		this._count = 256
	}

	/**
	 * Returns thresholded values.
	 * @param {number[]} x Training data
	 * @returns {(0 | 1)[]} Predicted values
	 */
	predict(x) {
		const max = x.reduce((m, v) => Math.max(m, v), -Infinity)
		const min = x.reduce((m, v) => Math.min(m, v), Infinity)

		const hist = Array(this._count).fill(0)
		for (let i = 0; i < x.length; i++) {
			if (x[i] === max) {
				hist[this._count - 1]++
			} else {
				hist[Math.floor(((x[i] - min) / (max - min)) * this._count)]++
			}
		}

		const kernel = []
		const ksize = 55
		const ksize2 = Math.floor(ksize / 2)
		let ksum = 0
		for (let i = 0; i < ksize; i++) {
			kernel[i] = Math.exp(-((i - ksize2) ** 2) / (2 * this._sigma ** 2))
			ksum += kernel[i]
		}
		for (let i = 0; i < kernel.length; i++) {
			kernel[i] /= ksum
		}

		const histbar = []
		for (let i = 0; i < hist.length; i++) {
			histbar[i] = 0
			for (let k = i - ksize2; k <= i + ksize2; k++) {
				if (k >= 0 && k < hist.length) {
					histbar[i] += hist[k] * kernel[k - i + ksize2]
				}
			}
		}

		const histdiff = [0]
		for (let i = 1; i < histbar.length; i++) {
			histdiff[i] = histbar[i - 1] - histbar[i]
		}
		histdiff.push(0)

		const m = []
		const es = []
		for (let i = 0; i < histdiff.length - 1; i++) {
			if (histdiff[i + 1] >= 0 && histdiff[i] <= 0) {
				m.push(i)
			}
			if (histdiff[i + 1] <= 0 && histdiff[i] >= 0) {
				es.push(i)
			}
		}
		const m0 = m[0]
		const m1 = m[m.length - 1]

		let s0 = 0
		let e0 = 0
		let s1 = 0
		let e1 = 0
		for (let i = 0; i < es.length; i++) {
			if (es[i] < m0) {
				s0 = es[i]
			} else if (es[i] > m0 && e0 === 0) {
				e0 = es[i]
			}
			if (es[i] < m1) {
				s1 = es[i]
			} else if (es[i] > m1 && e1 === 0) {
				e1 = es[i]
			}
		}

		this._th = (((1 - this._gamma) * e0 + this._gamma * s1 + 0.5) * (max - min)) / this._count + min

		return x.map(v => (v < this._th ? 0 : 1))
	}
}
