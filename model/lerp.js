class LinearInterpolation {
	// https://ja.wikipedia.org/wiki/%E7%B7%9A%E5%BD%A2%E8%A3%9C%E9%96%93
	constructor() {
	}

	predict(x, y, target) {
		const n = x.length
		const d = x.map((v, i) => [v, y[i]])
		d.sort((a, b) => a[0] - b[0])
		return target.map(t => {
			if (t <= d[0][0]) {
				return d[0][1]
			} else if (t >= d[n - 1][0]) {
				return d[n - 1][1]
			}
			for (let i = 1; i < n; i++) {
				if (t <= d[i][0]) {
					const p = (t - d[i - 1][0]) / (d[i][0] - d[i - 1][0])
					return p * (d[i][1] - d[i - 1][1]) + d[i - 1][1]
				}
			}
			return d[n - 1][1]
		})
	}
}

var dispLerp = function(elm, platform) {
	const calcLerp = function() {
		platform.plot((tx, ty, px, cb) => {
			let model = new LinearInterpolation();
			const data = tx.map(v => v[0])
			const pred = model.predict(tx.map(v => v[0]), ty.map(v => v[0]), px.map(v => v[0]))
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
	dispLerp(platform.setting.ml.configElement, platform);
}

