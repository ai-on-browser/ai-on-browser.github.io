class KLIEP {
	// https://github.com/hoxo-m/densratio
	constructor(sigma, fold, kernelNum) {
		this._sigma_cand = sigma
		this._fold = fold
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

	_optimize_alpha(a, b) {
		const c = b.copyDiv(b.norm() ** 2)

		let alpha = Matrix.ones(a.cols, 1)
		alpha.add(c.copyMult(1 - b.tDot(alpha).value[0]))
		alpha.map(v => v < 0 ? 0 : v)
		alpha.div(b.tDot(alpha).value[0])

		let score = a.dot(alpha)
		score.map(Math.log)
		score = score.mean()

		for (let k = 3; k >= -3; k--) {
			const epsilon = 10 ** k
			const epsa = a.copyMult(epsilon)
			for (let i = 0; i < 100; i++) {
				const alpha0 = epsa.tDot(a.dot(alpha).copyIdiv(1))
				alpha0.add(alpha)
				alpha0.add(c.copyMult(1 - b.tDot(alpha0).value[0]))
				alpha0.map(v => v < 0 ? 0 : v)
				alpha0.div(b.tDot(alpha0).value[0])

				let newScore = a.dot(alpha0)
				newScore.map(Math.log)
				newScore = newScore.mean()
				if (newScore <= score) {
					break
				}
				alpha = alpha0
				score = newScore
			}
		}
		return alpha
	}

	fit(x1, x2) {
		x1 = Matrix.fromArray(x1)
		x2 = Matrix.fromArray(x2)

		const n1 = x1.rows

		const kn = Math.min(this._kernelNum, n1)
		const centers = this._centers = x1.sampleRow(kn)

		this._sigma = this._sigma_cand[0]
		if (this._sigma_cand.length > 1) {
			let best_score = -Infinity
			const cvCls = []
			for (let i = 0; i < n1; i++) {
				cvCls[i] = i % this._fold
			}

			for (const sgm of this._sigma_cand) {
				const phi1 = this._kernel_gaussian(x1, centers, sgm)
				const phi2 = this._kernel_gaussian(x2, centers, sgm)
				const phi2mean = phi2.mean(0).t

				for (let i = cvCls.length - 1; i > 0; i--) {
					let r = Math.floor(Math.random() * (i + 1));
					[cvCls[i], cvCls[r]] = [cvCls[r], cvCls[i]]
				}

				let totalScore = 0
				for (let i = 0; i < this._fold; i++) {
					const idx = cvCls.map((c, t) => [c === i, t]).filter(v => v[0]).map(v => v[1])
					const nidx = cvCls.map((c, t) => [c === i, t]).filter(v => !v[0]).map(v => v[1])
					const alpha = this._optimize_alpha(phi1.row(idx), phi2mean)

					const score = phi1.row(nidx).dot(alpha)
					score.map(Math.log)
					totalScore += score.mean()
				}
				totalScore /= this._fold
				if (totalScore > best_score) {
					best_score = totalScore
					this._sigma = sgm
				}
			}
		}

		const phi1 = this._kernel_gaussian(x1, centers, this._sigma)
		const phi2 = this._kernel_gaussian(x2, centers, this._sigma)

		this._kw = this._optimize_alpha(phi1, phi2.mean(0).t)
	}

	predict(x) {
		const phi = this._kernel_gaussian(x, this._centers, this._sigma)
		return phi.dot(this._kw).value
	}
}

class KLIEPCPD {
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
		for (let i = 0; i < x.length - this._take - this._lag + 1; i++) {
			const h = Matrix.fromArray(x.slice(i, i + this._take))
			const t = Matrix.fromArray(x.slice(i + this._lag, i + this._take + this._lag))

			const model = new KLIEP([100, 10, 1, 0.1, 0.01, 0.001], 5, 100)
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

var dispKLIEP = function(elm, platform) {
	let thupdater = null
	const calcKLIEP = function() {
		platform.fit((tx, ty, cb, thup) => {
			const d = +elm.select("[name=window]").property("value");
			let model = new KLIEPCPD(d);
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
		.attr("value", 20)
		.attr("min", 1)
		.attr("max", 100)
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.01)
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
		.on("click", calcKLIEP);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispKLIEP(platform.setting.ml.configElement, platform)
}
