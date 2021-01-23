class SplineInterpolation {
	// https://en.wikipedia.org/wiki/Spline_interpolation
	constructor() {
	}

	predict(x, y, target) {
		const n = x.length
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		x = d.map(v => v[0])
		y = d.map(v => v[1])

		const A = Matrix.zeros(n, n)
		const B = new Matrix(n, 1)

		A.set(0, 0, 2 / (x[1] - x[0]))
		B.set(0, 0, 3 * (y[1] - y[0]) / (x[1] - x[0]) ** 2)
		for (let i = 1; i < n; i++) {
			A.set(i - 1, i, 1 / (x[i] - x[i - 1]))
			A.set(i, i - 1, 1 / (x[i] - x[i - 1]))
			if (i < n - 1) {
				A.set(i, i, 2 / (x[i] - x[i - 1]) + 2 / (x[i + 1] - x[i]))
				B.set(i, 0, 3 * ((y[i] - y[i - 1]) / (x[i] - x[i - 1]) ** 2 + (y[i + 1] - y[i]) / (x[i + 1] - x[i]) ** 2))
			} else {
				A.set(i, i, 2 / (x[i] - x[i - 1]))
				B.set(i, 0, 3 * (y[i] - y[i - 1]) / (x[i] - x[i - 1]) ** 2)
			}
		}

		const K = A.slove(B).value
		const a = []
		const b = []
		for (let i = 0; i < n - 1; i++) {
			a.push(K[i] * (x[i + 1] - x[i]) - (y[i + 1] - y[i]))
			b.push(-K[i + 1] * (x[i + 1] - x[i]) + (y[i + 1] - y[i]))
		}

		return target.map(v => {
			if (v < x[0]) {
				return y[0]
			}
			let i = 0
			for (; i < n - 1 && x[i + 1] <= v; i++);
			if (i === n - 1) {
				return y[n - 1]
			}

			const t = (v - x[i]) / (x[i + 1] - x[i])
			return (1 - t) * y[i] + t * y[i + 1] + t * (1 - t) * ((1 - t) * a[i] + t * b[i])
		})
	}
}

var dispSI = function(elm, platform) {
	const calcLerp = function() {
		platform.plot((tx, ty, px, cb) => {
			let model = new SplineInterpolation();
			const data = tx.map(v => v[0])
			const pred = model.predict(data, ty.map(v => v[0]), px.map(v => v[0]))
			cb(pred)
		}, 1)
	}

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcLerp);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispSI(platform.setting.ml.configElement, platform);
}
