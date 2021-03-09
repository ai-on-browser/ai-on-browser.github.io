class VBGMM {
	// https://qiita.com/ctgk/items/49d07215f700ecb03eeb
	// https://chrofieyue.hatenadiary.org/entry/20111202/1322832021
	// https://openbook4.me/projects/261/sections/1648
	constructor(a, b, k) {
		this._a0 = a
		this._b0 = b
		this._k = k
	}

	get means() {
		return this._m
	}

	get covs() {
		return this._nu.value.map((n, i) => this._w[i].copyMult(n).inv())
	}

	get effectivity() {
		return this._r.sum(0).value.map(v => v >= 1)
	}

	init(datas) {
		this._x = Matrix.fromArray(datas)
		const n = this._x.rows
		const d = this._x.cols
		const variance = this._x.variance(0).mean()

		this._m0 = Matrix.zeros(1, d)
		this._w0 = Matrix.eye(d, d, 1 / variance)

		this._nu0 = 1

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
		const m = this._x.row(cidx)
		const s = []
		for (let i = 0; i < this._k; i++) {
			s.push(Matrix.eye(d, d, variance))
		}

		this._r = new Matrix(n, this._k)
		for (let i = 0; i < this._k; i++) {
			const xi = this._x.copySub(m.row(i))
			const p = xi.dot(s[i].inv()).copyMult(xi).sum(1)
			const dv = Math.sqrt(s[i].det() * (2 * Math.PI) ** d)
			p.map(v => Math.exp(-v / 2) / dv)
			this._r.set(0, i, p)
		}

		this._r.div(this._r.sum(1))
		this._r.map(v => v < 1.0e-10 ? 1.0e-10 : v)
	}

	_digamma(z) {
		if (z <= 0) {
			throw "Invalid digamma value"
		}
		const eulers_c = 0.5772156649
		let s = -eulers_c
		let n = 0
		while (true) {
			const v = (z - 1) / ((n + 1) * (z + n))
			if (Math.abs(v) < 1.0e-12) break
			s += v
			n++
		}
		return s
	}

	fit() {
		const nk = this._r.sum(0)

		const xbar = this._r.tDot(this._x)
		xbar.div(nk.t)

		const nc = this._r.cols
		const d = this._x.cols
		const n = this._x.rows

		const sk = []
		for (let k = 0; k < nc; k++) {
			const cr = this._r.col(k)
			const xk = this._x.copySub(xbar.row(k))
			const s = xk.copyMult(cr).tDot(xk)
			s.div(nk.value[k])
			sk.push(s)
		}

		const alpha = this._p = nk.copyAdd(this._a0)
		this._p.div(this._p.sum())
		const beta = nk.copyAdd(this._b0)

		const r = this._m0.copyMult(this._b0)
		const mk = this._m = xbar.copyMult(nk.t).copyAdd(r)
		mk.div(beta.t)

		const w = this._w = []
		for (let k = 0; k < nc; k++) {
			const r = this._w0.inv()
			const nkk = nk.value[k]
			r.add(sk[k].copyMult(nkk))

			const fact = this._b0 * nkk / (this._b0 + nkk)
			const diff = xbar.row(k).copySub(this._m0)
			r.add(diff.tDot(diff).copyMult(fact))

			w.push(r.inv())
		}

		const nu = this._nu = nk.copyAdd(this._nu0)

		const ex_lpi = alpha.copyMap(v => this._digamma(v))
		ex_lpi.sub(this._digamma(alpha.sum()))
		const ex_log = Matrix.zeros(n, nc)
		for (let k = 0; k < nc; k++) {
			const nuk = nu.value[k]

			let ex_ll = d * Math.log(2) + Math.log(w[k].det())
			for (let i = 0; i < d; i++) {
				ex_ll += this._digamma((nuk - i) / 2)
			}

			const xk = this._x.copySub(mk.row(k))
			const ex_quad = xk.dot(w[k]).copyMult(xk).sum(1)
			ex_quad.mult(nuk)
			ex_quad.add(d / beta.value[k])

			ex_quad.map(v => (ex_ll - d * Math.log(2 * Math.PI) - v) / 2)

			ex_log.set(0, k, ex_quad)
		}

		const lrho = ex_log.copyAdd(ex_lpi)

		const new_r = Matrix.zeros(n, nc)
		for (let i = 0; i < n; i++) {
			const lr = lrho.row(i)
			const lse = Math.log(lr.value.reduce((s, v) => s + Math.exp(v), 0))
			lr.sub(lse)
			new_r.set(i, 0, lr)
		}
		new_r.map(Math.exp)
		new_r.div(new_r.sum(1))
		new_r.map(v => v < 1.0e-10 ? 1.0e-10 : v)

		this._r = new_r
	}

	probability(data) {
		const x = Matrix.fromArray(data)
		const covs = this.covs
		const p = new Matrix(x.rows, covs.length)
		for (let i = 0; i < covs.length; i++) {
			const d = x.copySub(this._m.row(i))
			let g = d.dot(covs[i].inv())
			g.mult(d)
			g = g.sum(1)

			const dv = Math.sqrt(covs[i].det() * (2 * Math.PI) ** x.cols)
			g.map(v => Math.exp(-v / 2) / dv)
			p.set(0, i, g)
		}
		p.mult(this._p)
		return p
	}

	predict(data) {
		return this.probability(data).argmax(1).value
	}
}

class VBGMMPlotter {
	constructor(svg, model) {
		this._r = svg.append("g").attr("class", "centroids");
		this._model = model
		this._size = model._k
		this._center = [];
		this._circle = [];
		this._rm = []
		this._duration = 200;
		this._scale = 1000

		for (let i = 0; i < this._size; i++) {
			this.add(i + 1)
		}
	}

	terminate() {
		this._r.remove();
	}

	add(category) {
		let cn = this._model.means.row(this._size - 1).value;
		let dp = new DataPoint(this._r, [cn[0] * this._scale, cn[1] * this._scale], category);
		dp.plotter(DataPointStarPlotter);
		this._center.push(dp);

		let cecl = this._r.append("ellipse")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("stroke", getCategoryColor(category))
			.attr("stroke-width", 2)
			.attr("fill-opacity", 0);
		this._set_el_attr(cecl, this._size - 1);
		this._circle.push(cecl);
		this._rm.push(false)
	}

	_set_el_attr(ell, i) {
		let cn = this._model.means.row(i).value;
		let s = this._model.covs[i].value;
		const su2 = (s[0] + s[3] + Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2;
		const sv2 = (s[0] + s[3] - Math.sqrt((s[0] - s[3]) ** 2 + 4 * s[1] ** 2)) / 2;
		const c = 2.146;
		let t = 360 * Math.atan((su2 - s[0]) / s[1]) / (2 * Math.PI);
		if (isNaN(t)) {
			t = 0
		}

		ell.attr("rx", c * Math.sqrt(su2) * this._scale)
			.attr("ry", c * Math.sqrt(sv2) * this._scale)
			.attr("transform", "translate(" + (cn[0] * this._scale) + "," + (cn[1] * this._scale) + ") " + "rotate(" + t + ")");
	}

	move() {
		for (let i = 0; i < this._center.length; i++) {
			if (!this._model.effectivity[i]) {
				if (!this._rm[i]) {
					this._center[i].remove()
					this._circle[i].remove()
				}
				this._rm[i] = true
			}
		}
		this._center.forEach((c, i) => {
			if (this._rm[i]) return
			let cn = this._model.means.row(i).value;
			c.move([cn[0] * this._scale, cn[1] * this._scale], this._duration);
		});
		this._circle.forEach((ecl, i) => {
			if (this._rm[i]) return
			this._set_el_attr(ecl.transition().duration(this._duration), i);
		});
	}
}

var dispVBGMM = function(elm, platform) {
	let model = null
	let plotter = null

	const fitModel = (cb) => {
		platform.fit(
			(tx, ty, pred_cb) => {
				if (!model) {
					const k = +elm.select("[name=k]").property("value")
					const a = +elm.select("[name=alpha]").property("value")
					const b = +elm.select("[name=beta]").property("value")
					model = new VBGMM(a, b, k)
					model.init(tx)
				}
				model.fit()
				const pred = model.predict(tx);
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=clusters]").text(model.effectivity.reduce((s, v) => s + (v ? 1 : 0), 0))
				if (!plotter) {
					plotter = new VBGMMPlotter(platform.svg, model)
				}
				plotter.move()
				cb && cb()
			}
		);
	}

	elm.append("span")
		.text(" alpha ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "alpha")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1.0e-3)
	elm.append("span")
		.text(" beta ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "beta")
		.attr("min", 0)
		.attr("max", 10)
		.attr("value", 1.0e-3)
	elm.append("span")
		.text(" k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 10)
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		model = null
		if (plotter) {
			plotter.terminate()
		}
		plotter = null
		elm.select("[name=clusters]").text(0)
	}).step(fitModel).epoch()
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");
	return () => {
		slbConf.stop()
		if (plotter) {
			plotter.terminate()
		}
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispVBGMM(platform.setting.ml.configElement, platform);
}
