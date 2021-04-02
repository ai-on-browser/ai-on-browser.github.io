class HMMBase {
	constructor(n) {
		this._n = n

		this._a = Matrix.random(this._n, this._n)
		this._a.div(this._a.sum(1))
		this._p = new Matrix(1, this._n, 1 / this._n)
	}

	_bt(x, t) {
		throw "Not implemented"
	}

	_forward(x, scaled = false) {
		let a = this._p.copy()
		const c = scaled && new Matrix(x.rows, x.cols)
		a.repeat(x.rows, 0)
		a.mult(this._bt(x, 0))
		if (c) {
			c.set(0, 0, a.sum(1))
			a.div(c.col(0))
		}
		const as = [a.copy()]
		for (let t = 1; t < x.cols; t++) {
			a = a.dot(this._a)
			a.mult(this._bt(x, t))
			if (c) {
				c.set(0, t, a.sum(1))
				a.div(c.col(t))
			}
			as.push(a.copy())
		}
		if (c) {
			return [as, c]
		}
		return as
	}

	_backward(x, c = null, prob = false) {
		let b = Matrix.ones(x.rows, this._n)
		const bs = [b.copy()]
		for (let t = x.cols - 1; t > 0; t--) {
			b.mult(this._bt(x, t))
			b = b.dot(this._a.t)
			if (c) {
				b.div(c.col(t))
			}
			bs.unshift(b.copy())
		}
		if (prob) {
			b.mult(this._bx(x, 0))
			b.mult(this._p)
		}
		return bs
	}

	_gamma(alpha, beta) {
		const gamma = []
		const an = alpha[alpha.length - 1].sum(1)
		for (let t = 0; t < alpha.length; t++) {
			const g = alpha[t].copyMult(beta[t])
			g.div(an)
			gamma.push(g)
		}
		return gamma
	}

	_xi(x, alpha, beta, c) {
		const xi = []
		const an = alpha[alpha.length - 1].sum(1)
		for (let t = 0; t < alpha.length - 1; t++) {
			xi[t] = []
			const bt = this._bt(x, t + 1)
			for (let k = 0; k < x.rows; k++) {
				const a = alpha[t].row(k).t
				const b = beta[t + 1].row(k)
				b.mult(bt.row(k))
				const z = this._a.copy()
				z.mult(a)
				z.mult(b)
				if (c) {
					z.div(c.at(k, t + 1))
				} else {
					z.div(an.value[k])
				}
				xi[t].push(z)
			}
		}
		return xi
	}

	_update(gamma, xi) {
		const n = gamma[0].rows
		const ah = Matrix.zeros(this._n, this._n)
		const gsum = Matrix.zeros(n, this._n)
		for (let t = 0; t < gamma.length - 1; t++) {
			gsum.add(gamma[t])
		}
		for (let k = 0; k < n; k++) {
			const zk = Matrix.zeros(this._n, this._n)
			for (let t = 0; t < xi.length; t++) {
				zk.add(xi[t][k])
			}
			zk.div(gsum.row(k).t)
			ah.add(zk)
		}
		ah.div(n)

		const ph = gamma[0].mean(0)

		this._a = ah
		this._p = ph
	}

	probability(x) {
		const alpha = this._forward(x)

		return alpha[alpha.length - 1].sum(1)
	}

	bestPath(x) {
		const path = new Matrix(x.rows, x.cols)
		const a = this._p.copy()
		a.repeat(x.rows, 0)
		a.mult(this._bt(x, 0))
		path.set(0, 0, a.argmax(1))

		for (let t = 1; t < x.cols; t++) {
			for (let k = 0; k < x.rows; k++) {
				const p = path.at(k, t - 1)
				const ak = this._a.row(p)
				ak.mult(a.at(k, p))
				a.set(k, 0, ak)
			}
			a.mult(this._bt(x, t))
			path.set(0, t, a.argmax(1))
		}
		return path
	}
}

class HMM extends HMMBase {
	// https://qiita.com/ta-ka/items/3e5306d0432c05909992
	// https://mieruca-ai.com/ai/viterbi_algorithm/
	constructor(n, l = 10) {
		super(n)
		this._l = l

		this._b = new Matrix(this._n, this._l, 1 / this._l)

		this._lmap = null
		this._type = "mealy"
	}

	_bt(x, t) {
		const b = new Matrix(x.rows, this._n)
		for (let i = 0; i < x.rows; i++) {
			b.set(i, 0, this._b.col(x.at(i, t)).t)
		}
		return b
	}

	_forward(x, scaled = false) {
		const lx = x.copyMap(v => this._lmap(v))
		return super._forward(lx, scaled)
	}

	_backward(x, c = null, prob = false) {
		const lx = x.copyMap(v => this._lmap(v))
		return super._backward(lx, c, prob)
	}

	setLabelFromData(data) {
		const x = Matrix.fromArray(data)
		if (!Array.isArray(x.at(0, 0))) {
			const max = x.max()
			const min = x.min()
			this._lmap = v => {
				const x = Math.floor((v - min) / (max - min) * this._l)
				return Math.max(0, Math.min(this._l - 1, x))
			}
		} else {
			const p = Matrix.fromArray(x.value)
			const pmax = p.max(0).value
			const pmin = p.min(0).value
			const r = Math.floor(Math.sqrt(this._l))
			this._lmap = v => {
				const x = v.map((t, i) => Math.floor((t - pmin[i]) / (pmax[i] - pmin[i]) * r))
				const z = x.reduce((s, t) => s * r + Math.min(r, t), 0)
				return Math.max(0, Math.min(this._l - 1, z))
			}
		}
	}

	fit(datas, scaled = false) {
		if (!this._lmap) {
			this.setLabelFromData(datas)
		}
		const x = Matrix.fromArray(datas)
		const n = x.rows
		const lx = x.copyMap(v => this._lmap(v))
		let alpha, c
		if (scaled) {
			[alpha, c] = this._forward(x, true)
		} else {
			alpha = this._forward(x)
		}
		const beta = this._backward(x, c)

		const gamma = this._gamma(alpha, beta)
		const xi = this._xi(lx, alpha, beta, c)

		this._update(gamma, xi)

		const gsum = Matrix.zeros(n, this._n)
		for (let t = 0; t < gamma.length; t++) {
			gsum.add(gamma[t])
		}

		const bh = Matrix.zeros(this._n, this._l)
		for (let k = 0; k < n; k++) {
			const dk = Matrix.zeros(this._n, this._l)
			for (let t = 0; t < x.cols; t++) {
				for (let i = 0; i < this._n; i++) {
					dk.addAt(i, lx.at(k, t), gamma[t].at(k, i))
				}
			}
			dk.div(gsum.row(k).t)
			bh.add(dk)
		}
		bh.div(n)

		this._b = bh
	}

	probability(datas) {
		const x = Matrix.fromArray(datas)
		return super.probability(x).value
	}

	bestPath(data) {
		const x = Matrix.fromArray(data)
		const lx = x.copyMap(v => this._lmap(v))
		return super.bestPath(lx).toArray()
	}
}

class ContinuousHMM extends HMMBase {
	// https://library.naist.jp/mylimedio/dllimedio/showpdf2.cgi/DLPDFR001283_P1
	// http://unicorn.ike.tottori-u.ac.jp/murakami/doctor/node16.html
	constructor(n, d) {
		super(n)
		this._k = 3
		this._d = d

		this._c = new Matrix(this._n, this._k, 1 / this._k)
		this._m = []
		this._s = []
		for (let i = 0; i < this._n; i++) {
			this._m[i] = Matrix.zeros(this._k, this._d)
			this._s[i] = []
			for (let j = 0; j < this._k; j++) {
				this._s[i][j] = Matrix.eye(this._d, this._d)
			}
		}
	}

	_btk(o, t, k) {
		o = Matrix.fromArray(o.col(t).value)
		const b = new Matrix(o.rows, this._n)
		for (let n = 0; n < this._n; n++) {
			const m = this._m[n]
			const s = this._s[n]

			const bn = Matrix.zeros(o.rows, 1)
			const cx = o.copySub(m.row(k))
			const tx = cx.dot(s[k].inv())
			tx.mult(cx)

			const v = tx.sum(1)
			const d = Math.sqrt((2 * Math.PI) ** this._d * s[k].det())
			v.map(a => Math.exp(-a / 2) / d * this._c.at(n, k))
			bn.add(v)

			b.set(0, n, bn)
		}
		return b
	}

	_bt(o, t) {
		o = Matrix.fromArray(o.col(t).value)
		const b = new Matrix(o.rows, this._n)
		for (let n = 0; n < this._n; n++) {
			const m = this._m[n]
			const s = this._s[n]
			const bn = Matrix.zeros(o.rows, 1)
			for (let k = 0; k < this._k; k++) {
				const cx = o.copySub(m.row(k))
				const tx = cx.dot(s[k].inv())
				tx.mult(cx)

				const v = tx.sum(1)
				const d = Math.sqrt((2 * Math.PI) ** this._d * s[k].det())
				v.map(a => Math.exp(-a / 2) / d * this._c.at(n, k))
				bn.add(v)
			}
			b.set(0, n, bn)
		}
		return b
	}

	fit(x, scaled = false) {
		x = Matrix.fromArray(x)
		let alpha, c
		if (scaled) {
			[alpha, c] = this._forward(x, true)
		} else {
			alpha = this._forward(x)
		}
		const beta = this._backward(x, c)

		const gamma = this._gamma(alpha, beta)
		const xi = this._xi(x, alpha, beta, c)

		this._update(gamma, xi)

		const gk = []
		const gksum = Matrix.zeros(x.rows, this._n)
		const gksum_t = []
		const b = []
		for (let i = 0; i < gamma.length; i++) {
			b[i] = this._bt(x, i)
		}
		for (let k = 0; k < this._k; k++) {
			gk[k] = []
			gksum_t[k] = Matrix.zeros(x.rows, this._n)
			for (let i = 0; i < gamma.length; i++) {
				const bk = this._btk(x, i, k)
				bk.div(b[i])
				bk.mult(gamma[i])
				gk[k][i] = bk
				gksum.add(bk)
				gksum_t[k].add(bk)
			}
		}

		const ch = new Matrix(this._n, this._k)
		for (let k = 0; k < this._k; k++) {
			ch.set(0, k, gksum_t[k].copyDiv(gksum).mean(0).t)
		}

		const xt = []
		for (let i = 0; i < x.cols; i++) {
			xt[i] = Matrix.fromArray(x.col(i).value)
		}
		const mh = []
		const sh = []
		for (let n = 0; n < this._n; n++) {
			const mhn = new Matrix(this._k, this._d)
			const shn = []
			for (let k = 0; k < this._k; k++) {
				const mhnk = Matrix.zeros(x.rows, this._d)

				for (let t = 0; t < x.cols; t++) {
					mhnk.add(xt[t].copyMult(gk[k][t].col(n)))
				}
				mhnk.div(gksum_t[k].col(n))
				mhn.set(k, 0, mhnk.mean(0))

				const shnk = Matrix.zeros(this._d, this._d)
				for (let i = 0; i < x.rows; i++) {
					const shnki = Matrix.zeros(this._d, this._d)
					for (let t = 0; t < x.cols; t++) {
						const xt_s = xt[t].row(i).copySub(this._m[n].row(k))
						const si = xt_s.tDot(xt_s)
						si.mult(gk[k][t].at(i, n))
						shnki.add(si)
					}
					shnki.div(gksum_t[k].at(i, n))
					shnk.add(shnki)
				}
				shnk.div(x.rows)
				shn[k] = shnk
			}
			mh[n] = mhn
			sh[n] = shn
		}

		this._c = ch
		this._m = mh
		this._s = sh
	}

	probability(datas) {
		const x = Matrix.fromArray(datas)
		return super.probability(x).value
	}

	bestPath(data) {
		const x = Matrix.fromArray(data)
		return super.bestPath(x).toArray()
	}
}

class HMMClassifier {
	constructor(classes, states, cls = ContinuousHMM) {
		this._classes = [...classes]
		this._models = []
		for (let i = 0; i < this._classes.length; i++) {
			const m = new cls(states, 1)
			this._models.push(m)
		}
	}

	fit(x, y) {
		for (let i = 0; i < this._models.length; i++) {
			const xi = x.filter((v, j) => this._classes[i] === y[j][0])
			this._models[i].fit(xi)
		}
	}

	predict(x) {
		const pred = []
		for (const model of this._models) {
			pred.push(model.probability(x))
		}

		const pm = Matrix.fromArray(pred)
		const p = pm.argmax(0)
		const ps = pm.max(0).value
		p.map((v, i) => ps[i] > 0 ? this._classes[v] : -1)
		return p.value
	}
}

var dispHMM = function(elm, platform) {
	let model = null
	const fitModel = function(cb) {
		platform.fit((tx, ty, pred_cb, thup) => {
			const states = +elm.select("[name=state]").property("value")
			if (platform.task === "CP") {
				if (!model) {
					model = new ContinuousHMM(states, tx[0].length)
				}
				const x = [tx]
				model.fit(x, true)
				const p = model.bestPath(x)[0]
				const d = []
				for (let i = 0; i < p.length - 1; i++) {
					d.push(p[i] !== p[i + 1])
				}
				pred_cb(d)
			} else {
				if (!model) {
					model = new HMMClassifier(new Set(ty.map(v => v[0])), states)
				}
				model.fit(tx, ty)

				platform.predict((px, pred_cb) => {
					const p = model.predict(px)
					pred_cb(p)
				}, 5)
				platform.evaluate((x, e_cb) => {
					e_cb(model.predict(x))
				})
			}
			cb && cb()
		})
	}

	elm.append("span")
		.text(" state = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "state")
		.attr("value", 3)
		.attr("min", 2)
		.attr("max", 100)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(fitModel).epoch()
	return () => {
		slbConf.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.terminate = dispHMM(platform.setting.ml.configElement, platform);
}
