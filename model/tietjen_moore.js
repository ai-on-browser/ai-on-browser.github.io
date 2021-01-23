class TietjenMoore {
	// https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h2.htm
	constructor(k) {
		this._k = k
		this._mode = 'both'
	}

	_test_static(x) {
		x = x.copy()
		if (this._mode === 'both') {
			x.sub(x.mean(0))
			x.abs()
			const z = x.max(1).value.map((v, i) => [v, i])
			z.sort((a, b) => b[0] - a[0])

			let zmean = 0, zkmean = 0
			for (let i = 0; i < z.length; i++) {
				zmean += z[i][0]
				if (i >= this._k) {
					zkmean += z[i][0]
				}
			}
			zmean /= z.length
			zkmean /= z.length - this._k

			let zvar = 0, zkvar = 0
			for (let i = 0; i < z.length; i++) {
				zvar += (z[i][0] - zmean) ** 2
				if (i >= this._k) {
					zkvar += (z[i][0] - zkmean) ** 2
				}
			}
			return [zkvar / zvar, z.slice(0, this._k).map(v => v[1])]
		}
	}

	predict(data, threshold) {
		const x = Matrix.fromArray(data);
		const [e, oi] = this._test_static(x)

		const t = Matrix.randn(10000, x.cols)
		t.mult(x.variance(0))
		const [et] = this._test_static(t)

		const outliers = Array(x.rows).fill(false)
		if (e < threshold) {
			for (let i = 0; i < oi.length; i++) {
				outliers[oi[i]] = true
			}
		}
		return outliers
	}
}

var dispTietjenMoore = function(elm, platform) {
	const calcTietjenMoore = function() {
		platform.plot((tx, ty, px, cb) => {
			const k = +elm.select("[name=k]").property("value")
			const threshold = +elm.select("[name=threshold]").property("value")
			const model = new TietjenMoore(k)
			const outliers = model.predict(tx, threshold);
			cb(outliers)
		}, 3)
	}

	elm.append("span")
		.text(" k = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("value", 5)
		.attr("min", 1)
		.attr("max", 100)
		.on("change", calcTietjenMoore);
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.2)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1)
		.on("change", calcTietjenMoore);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcTietjenMoore);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispTietjenMoore(platform.setting.ml.configElement, platform)
}
