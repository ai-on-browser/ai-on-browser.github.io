class RuLSIF {
	// https://github.com/hoxo-m/densratio
	constructor(sigma, lambda, alpha, kernelNum) {
		this._sigma_cand = sigma
		this._lambda_cand = lambda
		this._alpha = alpha
		this._kernelNum = kernelNum
	}

	_kernel_gaussian(x, c, s) {
		const k = []
		for (let i = 0; i < c.rows; i++) {
			const ki = []
			for (let j = 0; j < x.rows; j++) {
				const r = c.row(i).copySub(x.row(j))
				ki.push(Math.exp(-r.reduce((ss, v) => ss + v ** 2, 0) / (2 * s ** 2)))
			}
			k.push(ki)
		}
		return Matrix.fromArray(k)
	}

	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows
		const n2 = x2.rows

		const kn = Math.min(this._kernelNum, n1)
		const cidx = []
		for (let i = 0; i < kn; i++) {
			cidx.push(Math.floor(Math.random() * (n1 - i)))
		}
		for (let i = kn - 1; i >= 0; i--) {
			for (let j = kn - 1; j > i; j--) {
				if (cidx[i] <= cidx[j]) {
					cidx[j]++
				}
			}
		}

		const centers = this._centers = x1.row(cidx)

		this._sigma = this._sigma_cand[0]
		this._lambda = this._lambda_cand[0]
		if (this._sigma_cand.length > 1 || this._lambda_cand.length > 1) {
			const nmin = Math.min(n1, n2)

			let best_score = Infinity
			for (const sgm of this._sigma_cand) {
				let phi1 = this._kernel_gaussian(x1, centers, sgm)
				let phi2 = this._kernel_gaussian(x2, centers, sgm)
				const H1 = phi1.tDot(phi1)
				H1.mult(this._alpha / n1)
				const H2 = phi2.tDot(phi2)
				H2.mult((1 - this._alpha) / n2)
				const H = H1.copyAdd(H2)
				const h = H.mean(0).t

				phi1 = phi1.sliceRow(0, nmin).t
				phi2 = phi2.sliceRow(0, nmin).t

				for (const lmb of this._lambda_cand) {
					const B = Matrix.eye(kn, kn, lmb * (n2 - 1) / n2)
					B.add(H)
					const Binv = B.inv()
					const BinvX = Binv.dot(phi2)
					const XBinvX = phi2.dot(BinvX)

					const denom = new Matrix(1, nmin, n2)
					denom.sub(XBinvX.sum(0))

					const B0 = Binv.dot(h.dot(Matrix.ones(1, nmin)))
					B0.add(BinvX.dot(Matrix.diag(h.tDot(BinvX).copyDiv(denom).value)))
					const B1 = Binv.dot(phi1)
					B1.add(BinvX.dot(Matrix.diag(phi1.copyMult(BinvX).sum(0).copyDiv(denom).value)))
					const B2 = B0.copyMult(n1)
					B2.sub(B1)
					B2.mult((n2 - 1) / (n2 * (n1 - 1)))
					B2.map(v => v < 0 ? 0 : v)

					const r2 = phi2.copyMult(B2).sum(0).t
					const r1 = phi1.copyMult(B2).sum(0).t
					const score = (r2.tDot(r2).value[0] / 2 - r1.sum()) / nmin
					if (score < best_score) {
						best_score = score
						this._sigma = sgm
						this._lambda = lmb
					}
				}
			}
		}

		const phi1 = this._kernel_gaussian(x1, centers, this._sigma)
		const phi2 = this._kernel_gaussian(x2, centers, this._sigma)
		const H1 = phi1.tDot(phi1)
		H1.mult(this._alpha / n1)
		const H2 = phi2.tDot(phi2)
		H2.mult((1 - this._alpha) / n2)
		const H = H1.copyAdd(H2)
		const h = H.mean(0).t

		const B = Matrix.eye(kn, kn, this._lambda * (n2 - 1) / n2)
		B.add(H)
		this._kw = B.inv().dot(h)
		this._kw.map(v => v < 0 ? 0 : v)
	}

	predict(x) {
		const phi = this._kernel_gaussian(x, this._centers, this._sigma)
		return phi.dot(this._kw).value
	}
}

class uLSIF {
	constructor(w, take, lag) {
		this._window = w
		this._take = take || Math.max(1, Math.floor(w / 2))
		this._lag = lag || Math.max(1, Math.floor(this._take / 2))
	}

	predict(datas) {
		const x = []
		for (let i = 0; i < datas.length - this._window + 1; i++) {
			x.push(datas.slice(i, i + this._window).flat())
		}

		const pred = []
		const k = Math.min(2, this._take)
		const selc = []
		for (let i = 0; i < k; selc.push(i++));
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take))
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag))

			const model = new RuLSIF([100, 10, 1, 0.1, 0.01, 0.001], [100, 10, 1, 0.1, 0.01, 0.001], 0.1, 100)
			let c = 0
			model.fit(h, t)
			let dr = model.predict(t)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] - 1) ** 2 / dr.length
			}
			model.fit(t, h)
			dr = model.predict(h)
			for (let i = 0; i < dr.length; i++) {
				c += (dr[i] - 1) ** 2 / dr.length
			}
			pred.push(c)
		}
		return pred
	}
}

var dispULSIF = function(elm, platform) {
	let thupdater = null
	const calcULSIF = function() {
		platform.fit((tx, ty, cb, thup) => {
			const d = +elm.select("[name=window]").property("value");
			let model = new uLSIF(d);
			const threshold = +elm.select("[name=threshold]").property("value")
			const pred = model.predict(tx)
			for (let i = 0; i < d * 3 / 8; i++) {
				pred.unshift(0)
			}
			thupdater = thup
			cb(pred, threshold)
		})
	}

	elm.append("span")
		.text(" window = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "window")
		.attr("value", 10)
		.attr("min", 1)
		.attr("max", 100)
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.1)
		.attr("min", 0)
		.attr("max", 1000)
		.attr("step", 0.01)
		.on("change", () => {
			const threshold = +elm.select("[name=threshold]").property("value")
			if (thupdater) {
				thupdater(threshold)
			}
		})
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcULSIF);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispULSIF(platform.setting.ml.configElement, platform)
}
