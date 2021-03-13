const fastMap = (x, rd) => {
	// http://ibisforest.org/index.php?FastMap
	const d = []
	const n = x.length
	const m = x[0].length
	for (let i = 0; i < n; d[i++] = []);
	for (let i = 0; i < n; i++) {
		d[i][i] = 0
		for (let j = i + 1; j < n; j++) {
			let ds = 0
			for (let k = 0; k < m; k++) {
				ds += (x[i][k] - x[j][k]) ** 2
			}
			d[i][j] = d[j][i] = Math.sqrt(ds)
		}
	}

	const argmax = arr => {
		let idx = -1
		let val = -Infinity
		for (let i = 0; i < arr.length; i++) {
			if (val < arr[i]) {
				val = arr[i]
				idx = i
			}
		}
		return idx
	}

	const y = []
	for (let i = 0; i < n; y[i++] = []);
	for (let k = 0; k < rd; k++) {
		const p = Math.floor(Math.random() * n)
		const a = argmax(d[p])
		const b = argmax(d[a])

		for (let i = 0; i < n; i++) {
			y[i][k] = (d[a][i] ** 2 + d[a][b] ** 2 - d[b][i] ** 2) / (2 * d[a][b])
		}

		for (let i = 0; i < n; i++) {
			for (let j = i + 1; j < n; j++) {
				d[i][j] = d[j][i] = Math.sqrt(d[i][j] ** 2 - (y[i][k] - y[j][k]) ** 2)
			}
		}
	}
	return y
}

var dispFastMap = function(elm, platform) {
	const fitModel = cb => {
		const dim = platform.dimension
		platform.fit((tx, ty, pred_cb) => {
			const pred = fastMap(tx, dim)
			pred_cb(pred)
			cb && cb()
		})
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispFastMap(platform.setting.ml.configElement, platform);
}

