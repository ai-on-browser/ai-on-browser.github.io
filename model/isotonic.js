const isotonicRegression = (y) => {
	// http://kasuya.ecology1.org/stats/isoreg1.html
	const csd = [0]
	let k = 0
	for (let i = 1; i <= y.length; i++) {
		csd[i] = csd[i - 1] + y[i - 1]
		if (k <= y[i - 1]) {
			k = y[i - 1]
		} else {
			let c = 0
			for (let j = i - 2; j >= 1; j--) {
				if (csd[j] - csd[j - 1] <= (csd[i] - csd[j]) / (i - j)) {
					c = j
					k = (csd[i] - csd[j]) / (i - j)
					break
				}
			}
			for (let j = c + 1; j < i; j++) {
				csd[j] = csd[c] + k * (j - c)
			}
		}
	}
	return csd.slice(1).map((v, i) => v - csd[i])
}

var dispIsotonic = function(elm, platform) {
	const task = platform.task
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		platform.plot((tx, ty, px, pred_cb) => {
			const p = isotonicRegression(ty.map(v => v[0]))
			const pred = []
			let i = 0, j = 0
			while (i < px.length) {
				if (j === tx.length - 1 || px[i][0] <= tx[j][0]) {
					i++
					pred.push(p[j])
				} else {
					j++
				}
			}
			pred_cb(pred)
		}, 1);
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button. This model works with 1D data only.'
	dispIsotonic(platform.setting.ml.configElement, platform);
}

