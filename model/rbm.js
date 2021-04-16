class RBM {
	// https://recruit.gmo.jp/engineer/jisedai/blog/rbm_movie_recommendation_pytorch/
	// https://qiita.com/t_Signull/items/f776aecb4909b7c5c116
	// https://en.wikipedia.org/wiki/Restricted_Boltzmann_machine
	constructor(hiddenSize) {
		this._hidden = hiddenSize
		this._visible = null
		this._w = null
		this._a = []
		this._b = []
		this._lr = 0.1
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

	_h(v) {
		const h = []
		for (let i = 0; i < this._w[0].length; i++) {
			let a = this._b[i]
			for (let j = 0; j < this._w.length; j++) {
				a += this._w[j][i] * v[j]
			}
			h[i] = this._sgm(a)
		}
		return h
	}

	_v(h) {
		const v = []
		for (let i = 0; i < this._w.length; i++) {
			let a = this._a[i]
			for (let j = 0; j < this._w[i].length; j++) {
				a += this._w[i][j] * h[j]
			}
			v[i] = this._sgm(a)
		}
		return v
	}

	_sample(a) {
		return a.map(v => v > Math.random() ? 1 : 0)
	}

	fit(x) {
		this._normalize(x)
		if (!this._w) {
			this._visible = x[0].length
			this._w = Matrix.randn(this._visible, this._hidden).toArray()
			this._a = Array(this._visible).fill(0)
			this._b = Array(this._hidden).fill(0)
		}
		for (let t = 0; t < x.length; t++) {
			const v1 = x[t]
			const h1 = this._sample(this._h(v1))
			let vn = this._sample(this._v(h1))
			let hn = this._sample(this._h(vn))
			for (let k = 1; k < this._k; k++) {
				vn = this._sample(this._v(hn))
				hn = this._sample(this._h(vn))
			}

			for (let i = 0; i < this._w.length; i++) {
				for (let j = 0; j < this._w[i].length; j++) {
					this._w[i][j] += this._lr * (v1[i] * h1[j] - vn[i] * vn[j])
				}
			}
			for (let i = 0; i < this._w.length; i++) {
				this._a[i] += this._lr * (v1[i] - vn[i])
			}
			for (let j = 0; j < this._w[0].length; j++) {
				this._b[j] += this._lr * (h1[j] - hn[j])
			}
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
		this._normalize([x])
		const h1 = this._sample(this._h(x))
		return this._sample(this._v(h1))
	}
}

var dispRBM = function(elm, platform) {
	platform.colorSpace = '8 colors'
	let model = null
	let y = null
	let pcb = null
	const fitModel = (cb) => {
		platform.fit((tx, ty) => {
			const x = tx.flat(2)
			if (!model) {
				model = new RBM(10)
			}
			model.fit([x])

			platform.predict((px, pred_cb) => {
				y = px.flat(2)
				model._normalize([y])
				y = model.predict(y)
				pcb = p => pred_cb(p.map(v => v * 255))
				pcb(y)
				cb && cb()
			}, 8)
		}, null, 8);
	}

	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		platform.init()
	}).step(fitModel).epoch()

	elm.append("epan")
		.text(" Estimate")
	const slbConf2 = platform.setting.ml.controller.stepLoopButtons().init(() => {
		if (!model) return
		platform.predict((px, pred_cb) => {
			y = px.flat(2)
			model._normalize([y])
			pcb = p => pred_cb(p.map(v => v * 255))
			pcb(y)
		}, 8)
	}).step(cb => {
		if (!model) return
		y = model.predict(y)
		pcb(y)
		cb && cb()
	})
	return () => {
		slbConf.stop()
		slbConf2.stop()
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button. Then, click "estimate" button.'
	platform.setting.terminate = dispRBM(platform.setting.ml.configElement, platform);
}
