export default class OtsusThresholding {
	// https://en.wikipedia.org/wiki/Otsu%27s_method
	// https://qiita.com/haru1843/items/00de955790d3a22a217b
	constructor() {}

	predict(x) {
		this._x = x
		const n = this._x.length

		let best_t = 0
		let best_s = 0
		for (let t = 0; t < 255; t++) {
			let p0 = 0,
				p1 = 0,
				m = 0,
				m0 = 0,
				m1 = 0
			for (let i = 0; i < n; i++) {
				if (this._x[i] < t) {
					p0++
					m0 += this._x[i]
				} else {
					p1++
					m1 += this._x[i]
				}
				m += this._x[i]
			}
			const r0 = p0 / n
			const r1 = p1 / n
			m /= n
			m0 /= n
			m1 /= n

			const s = r0 * r1 * (m0 - m1) ** 2
			if (best_s < s) {
				best_s = s
				best_t = t
			}
		}
		this._t = best_t
		return this._x.map(v => (v < best_t ? 0 : 1))
	}
}
