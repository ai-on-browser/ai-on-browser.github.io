export class LVQCluster {
	// https://www.researchgate.net/publication/224751633_Learning_vector_quantization_Cluster_size_and_cluster_number
	constructor(k) {
		this._k = k
		this._w = null
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_nearest(v) {
		let min_d = Infinity
		let min_c = -1
		for (let i = 0; i < this._w.length; i++) {
			const d = this._distance(v, this._w[i])
			if (d < min_d) {
				min_d = d
				min_c = i
			}
		}
		return min_c
	}

	_init(x) {
		const n = x.length
		const cidx = []
		for (let i = 0; i < this._k; i++) {
			cidx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = this._k - 1; i >= 0; i--) {
			for (let j = this._k - 1; j > i; j--) {
				if (cidx[i] <= cidx[j]) {
					cidx[j]++
				}
			}
		}
		this._w = []
		for (let i = 0; i < this._k; i++) {
			this._w[i] = x[cidx[i]]
		}
	}

	fit(x, lr = 0.1) {
		if (!this._w) {
			this._init(x)
		}

		for (let i = 0; i < x.length; i++) {
			const m = this._nearest(x[i])
			this._w[m] = this._w[m].map((v, d) => v + lr * (x[i][d] - v))
		}
	}

	predict(datas) {
		if (this._w.length === 0) {
			return
		}
		return datas.map(v => this._nearest(v))
	}
}

export class LVQClassifier {
	// https://en.wikipedia.org/wiki/Learning_vector_quantization
	// https://www.slideshare.net/miyoshiyuya/9
	// https://jp.mathworks.com/help/deeplearning/ug/learning-vector-quantization-lvq-neural-networks-1.html
	constructor(type) {
		this._m = null
		this._c = []
		this._type = type
		this._w = 0.2
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	_nears(v) {
		const ns = []
		for (let i = 0; i < this._m.length; i++) {
			const d = this._distance(v, this._m[i])
			let k = 0
			for (; k < ns.length; k++) {
				if (d < ns[k].d) {
					break
				}
			}
			ns.splice(k, 0, { d: d, c: this._c[i], i: i })
		}
		return ns
	}

	_init(x, y) {
		const n = x.length
		this._c = [...new Set(y)]
		this._m = []
		for (let i = 0; i < n; i++) {
			const p = this._c.indexOf(y[i])
			if (!this._m[p]) {
				this._m[p] = x[i].concat()
			}
		}
	}

	fit(x, y, lr = 0.1) {
		if (!this._m) {
			this._init(x, y)
		}

		for (let i = 0; i < x.length; i++) {
			if (this._type === 1) {
				const m = this._nears(x[i])[0]
				if (y[i] === m.c) {
					this._m[m.i] = this._m[m.i].map((v, d) => v + lr * (x[i][d] - v))
				} else {
					this._m[m.i] = this._m[m.i].map((v, d) => v - lr * (x[i][d] - v))
				}
			} else if (this._type === 2) {
				const ns = this._nears(x[i])
				const mj = ns.find(n => n.c === y[i])
				const mi = ns.find(n => n.c !== y[i])
				const s = (1 - this._w) / (1 + this._w)
				if (Math.min(mj.d / mi.d, mi.d / mj.d) > s) {
					this._m[mj.i] = this._m[mj.i].map((v, d) => v + lr * (x[i][d] - v))
					this._m[mi.i] = this._m[mi.i].map((v, d) => v - lr * (x[i][d] - v))
				}
			} else if (this._type === 3) {
				const ns = this._nears(x[i])
				const mi = ns[0]
				const mj = ns[1]
				if (mi.c === y[i] && mj.c === y[i]) {
					this._m[m.i] = this._m[m.i].map((v, d) => v + lr * (x[i][d] - v))
				} else if (mi.c !== y[i] && mj.c === y[i]) {
					const s = (1 - this._w) / (1 + this._w)
					if (Math.min(mj.d / mi.d, mi.d / mj.d) > s) {
						this._m[mj.i] = this._m[mj.i].map((v, d) => v + lr * (x[i][d] - v))
						this._m[mi.i] = this._m[mi.i].map((v, d) => v - lr * (x[i][d] - v))
					}
				}
			}
		}
	}

	predict(datas) {
		if (this._m.length === 0) {
			return
		}
		return datas.map(v => this._nears(v)[0].c)
	}
}
