import { Matrix } from '../js/math.js'

export default class ParticleFilter {
	// https://saltcooky.hatenablog.com/entry/2020/08/11/231716
	constructor() {
		this._n = 2000
		this._l = 20
		this._noise = 0.2
	}

	fit(z) {
		const n = z.length
		const d = z[0].length
		z = Matrix.fromArray(z).t
		const xx = [z.col(0).copyRepeat(this._n, 1)]

		for (let i = 0; i < n; i++) {
			const x = xx[i].copyAdd(Matrix.randn(d, this._n).copyMult(this._noise))
			const w = z.col(i).copySub(x)
			w.map(v => Math.exp(-(v ** 2)))

			const wsum = [w.col(0).mean()]
			for (let j = 1; j < this._n; j++) {
				wsum[j] = wsum[j - 1] + w.col(j).mean()
			}
			const total = wsum[this._n - 1]
			const r = Math.floor(Math.random() * total)
			const pos = []
			for (let j = 0; j < this._n; j++) {
				pos[j] = ((j * total) / this._n + r) % total
			}
			const sp = []
			for (let j = 0; j < this._n; j++) {
				for (let k = 0; k < this._n; k++) {
					if (wsum[k] >= pos[j]) {
						sp[j] = k
						break
					}
				}
			}

			for (let j = 0; j < this._l; j++) {
				let p = i - (this._l - j)
				if (p < 0) p = 0
				xx[p] = xx[p].col(sp)
			}
			xx[i] = x.col(sp)
			xx[i + 1] = xx[i]
		}

		return xx.map(x => x.mean(1).value)
	}

	predict(k) {
		const pred = []
		return pred
	}
}
