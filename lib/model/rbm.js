import { Matrix } from '../util/math.js'

export class RBM {
	// https://recruit.gmo.jp/engineer/jisedai/blog/rbm_movie_recommendation_pytorch/
	// https://qiita.com/t_Signull/items/f776aecb4909b7c5c116
	// https://en.wikipedia.org/wiki/Restricted_Boltzmann_machine
	constructor(hiddenSize, lr = 0.01) {
		this._hidden = hiddenSize
		this._visible = null
		this._w = null
		this._a = []
		this._b = []
		this._lr = lr
		this._k = 1
	}

	_normalize(x) {
		let max = -Infinity
		let min = Infinity
		for (let k = 0; k < x.length; k++) {
			for (let i = 0; i < x[k].length; i++) {
				max = Math.max(max, x[k][i])
				min = Math.min(min, x[k][i])
			}
		}
		for (let k = 0; k < x.length; k++) {
			for (let i = 0; i < x[k].length; i++) {
				x[k][i] = x[k][i] < (max + min) / 2 ? 0 : 1
			}
		}
	}

	_sgm(x) {
		return 1 / (1 + Math.exp(-x))
	}

	_h(v, sample = false) {
		const h = []
		for (let k = 0; k < v.length; k++) {
			h[k] = []
			for (let j = 0; j < this._w[0].length; j++) {
				let a = this._b[j]
				for (let i = 0; i < this._w.length; i++) {
					a += this._w[i][j] * v[k][i]
				}
				h[k][j] = this._sgm(a)
				if (sample) {
					h[k][j] = h[k][j] > Math.random() ? 1 : 0
				}
			}
		}
		return h
	}

	_v(h, sample = false) {
		const v = []
		for (let k = 0; k < h.length; k++) {
			v[k] = []
			for (let i = 0; i < this._w.length; i++) {
				let a = this._a[i]
				for (let j = 0; j < this._w[i].length; j++) {
					a += this._w[i][j] * h[k][j]
				}
				v[k][i] = this._sgm(a)
				if (sample) {
					v[k][i] = v[k][i] > Math.random() ? 1 : 0
				}
			}
		}
		return v
	}

	fit(x) {
		this._normalize(x)
		if (!this._w) {
			this._visible = x[0].length
			this._w = Matrix.randn(this._visible, this._hidden).toArray()
			this._a = Array(this._visible).fill(0)
			this._b = Array(this._hidden).fill(0)
		}
		const v1 = x
		const h1 = this._h(v1)
		let vn = this._v(h1)
		let hn = this._h(vn)
		for (let k = 1; k < this._k; k++) {
			vn = this._v(hn)
			hn = this._h(vn)
		}

		for (let i = 0; i < this._w.length; i++) {
			for (let j = 0; j < this._w[i].length; j++) {
				let v = 0
				for (let k = 0; k < x.length; k++) {
					v += v1[k][i] * h1[k][j] - vn[k][i] * hn[k][j]
				}
				this._w[i][j] += (this._lr * v) / x.length
			}
		}
		for (let i = 0; i < this._w.length; i++) {
			let v = 0
			for (let k = 0; k < x.length; k++) {
				v += v1[k][i] - vn[k][i]
			}
			this._a[i] += (this._lr * v) / x.length
		}
		for (let j = 0; j < this._w[0].length; j++) {
			let v = 0
			for (let k = 0; k < x.length; k++) {
				v += h1[k][j] - hn[k][j]
			}
			this._b[j] += (this._lr * v) / x.length
		}
	}

	energy(v, h) {
		this._normalize([v, h])
		let e = 0
		for (let i = 0; i < this._w.length; i++) {
			for (let j = 0; j < this._w[i].length; j++) {
				e -= this._w[i][j] * v[i] * h[j]
			}
		}
		for (let i = 0; i < this._w.length; i++) {
			e -= this._a[i] * v[i]
		}
		for (let j = 0; j < this._w[0].length; j++) {
			e -= this._b[j] * h[j]
		}
		return e
	}

	predict(x) {
		this._normalize(x)
		const h1 = this._h(x, true)
		return this._v(h1, true)
	}
}

export class GBRBM {
	// https://www.ieice.org/publications/conference-FIT-DVDs/FIT2015/data/pdf/F-024.pdf
	// https://qiita.com/ryo_he_0/items/150b4845a8ea968cc6f0
	constructor(hiddenSize, lr = 0.01, fixSigma = false) {
		this._hidden = hiddenSize
		this._visible = null
		this._w = null
		this._b = []
		this._z = []
		this._c = []
		this._lr = lr
		this._fixSigma = fixSigma
		this._k = 1
	}

	_randn() {
		return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random())
	}

	get _s() {
		return this._z.map(Math.exp)
	}

	_h(v, sample = false) {
		const h = []
		const s = this._s
		for (let k = 0; k < v.length; k++) {
			h[k] = []
			for (let j = 0; j < this._w[0].length; j++) {
				let a = this._c[j]
				for (let i = 0; i < this._w.length; i++) {
					a += (this._w[i][j] * v[k][i]) / s[i]
				}
				h[k][j] = 1 / (1 + Math.exp(-a))
				if (sample) {
					h[k][j] = h[k][j] > Math.random() ? 1 : 0
				}
			}
		}
		return h
	}

	_v(h, sample = false) {
		const v = []
		const s = this._s
		for (let k = 0; k < h.length; k++) {
			v[k] = []
			for (let i = 0; i < this._w.length; i++) {
				let a = this._b[i]
				for (let j = 0; j < this._w[i].length; j++) {
					a += this._w[i][j] * h[k][j]
				}
				v[k][i] = a
				if (sample) {
					v[k][i] += this._randn() * Math.sqrt(s[i])
				}
			}
		}
		return v
	}

	fit(x) {
		if (!this._w) {
			this._visible = x[0].length
			this._w = Matrix.randn(this._visible, this._hidden).toArray()
			this._b = Array(this._visible).fill(0)
			this._z = Array(this._visible).fill(0)
			this._c = Array(this._hidden).fill(0)
		}
		const v1 = x
		const h1 = this._h(x)
		let vn = this._v(h1, true)
		let hn = this._h(vn, true)
		for (let k = 0; k < this._k; k++) {
			vn = this._v(hn, true)
			hn = this._h(vn, true)
		}

		const s = this._s
		if (!this._fixSigma) {
			for (let i = 0; i < this._w.length; i++) {
				let s1 = 0
				let s2 = 0
				for (let t = 0; t < x.length; t++) {
					s1 += (v1[t][i] - this._b[i]) ** 2 / 2
					s2 += (vn[t][i] - this._b[i]) ** 2 / 2
					for (let j = 0; j < this._w[0].length; j++) {
						s1 -= h1[t][j] * this._w[i][j] * v1[t][i]
						s2 -= hn[t][j] * this._w[i][j] * vn[t][i]
					}
				}
				this._z[i] += (this._lr * (s1 - s2)) / s[i] / x.length
			}
		}
		for (let i = 0; i < this._w.length; i++) {
			for (let j = 0; j < this._w[i].length; j++) {
				let v = 0
				for (let t = 0; t < x.length; t++) {
					v += v1[t][i] * h1[t][j] - vn[t][i] * hn[t][j]
				}
				this._w[i][j] += (this._lr * v) / s[i] / x.length
			}
		}
		for (let i = 0; i < this._w.length; i++) {
			let v = 0
			for (let t = 0; t < x.length; t++) {
				v += v1[t][i] - vn[t][i]
			}
			this._b[i] += (this._lr * v) / s[i] / x.length
		}
		for (let j = 0; j < this._w[0].length; j++) {
			let v = 0
			for (let t = 0; t < x.length; t++) {
				v += h1[t][j] - hn[t][j]
			}
			this._c[j] += (this._lr * v) / x.length
		}
	}

	energy(v, h) {
		let e = 0
		for (let i = 0; i < this._w.length; i++) {
			for (let j = 0; j < this._w[i].length; j++) {
				e -= (this._w[i][j] * v[i] * h[j]) / Math.exp(this._z[i])
			}
		}
		for (let i = 0; i < this._w.length; i++) {
			e += (v[i] - this._b[i]) ** 2 / (2 * Math.exp(this._z[i]))
		}
		for (let j = 0; j < this._w[0].length; j++) {
			e -= this._c[j] * h[j]
		}
		return e
	}

	predict(x) {
		const h1 = this._h(x)
		return this._v(h1, true)
	}
}
