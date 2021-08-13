export default class SavitzkyGolayFilter {
	// https://en.wikipedia.org/wiki/Savitzky%E2%80%93Golay_filter
	// http://vp-happy-rikei-life.com/archives/9254949.html
	constructor(k) {
		this._k = k
		this._t = (k - 1) / 2

		const c = (m, i) => {
			return (3 * m ** 2 - 7 - 20 * i ** 2) / 4 / ((m * (m ** 2 - 4)) / 3)
		}
		this._w = []
		for (let i = -this._t; i <= this._t; i++) {
			this._w.push(c(this._k, i))
		}
	}

	_predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			const s = Math.max(0, i - this._t)
			const e = Math.min(x.length - 1, i + this._t)
			const target = x.slice(s, e + 1)

			if (target.length < this._k) {
				p.push(x[i])
			} else {
				let v = 0
				for (let k = 0; k < target.length; k++) {
					v += target[k] * this._w[k]
				}
				p.push(v)
			}
		}
		return p
	}

	predict(x) {
		const p = []
		for (let i = 0; i < x.length; i++) {
			p[i] = []
		}
		for (let d = 0; d < x[0].length; d++) {
			const pd = this._predict(x.map(v => v[d]))
			for (let i = 0; i < x.length; i++) {
				p[i][d] = pd[i]
			}
		}
		return p
	}
}
