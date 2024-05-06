/**
 * Otus's thresholding
 */
export default class OtsusThresholding {
	// https://en.wikipedia.org/wiki/Otsu%27s_method
	// https://qiita.com/haru1843/items/00de955790d3a22a217b
	constructor() {
		this._count = 200
	}

	/**
	 * Returns thresholded values.
	 * @param {number[]} x Training data
	 * @returns {(0 | 1)[]} Predicted values
	 */
	predict(x) {
		this._x = x
		const n = this._x.length
		const max = x.reduce((m, v) => Math.max(m, v), -Infinity)
		const min = x.reduce((m, v) => Math.min(m, v), Infinity)
		const th = []
		for (let i = 0; i < this._count; i++) {
			th[i] = (i * (max - min)) / this._count + min
		}
		th.push(max)

		let best_t = 0
		let best_s = 0
		for (let t = 0; t < th.length; t++) {
			let p0 = 0,
				p1 = 0,
				m0 = 0,
				m1 = 0
			for (let i = 0; i < n; i++) {
				if (this._x[i] < th[t]) {
					p0++
					m0 += this._x[i]
				} else {
					p1++
					m1 += this._x[i]
				}
			}
			const r0 = p0 / n
			const r1 = p1 / n
			m0 /= p0
			m1 /= p1

			const s = r0 * r1 * (m0 - m1) ** 2
			if (best_s < s) {
				best_s = s
				best_t = t
			}
		}
		this._t = th[best_t]
		return this._x.map(v => (v < this._t ? 0 : 1))
	}
}
