const simpleMovingAverage = (data, n) => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const t = Math.min(n, i + 1)
		p[i] = Array(d).fill(0)
		for (let k = i - t + 1; k <= i; k++) {
			for (let j = 0; j < d; j++) {
				p[i][j] += data[k][j]
			}
		}
		for (let j = 0; j < d; j++) {
			p[i][j] /= t
		}
	}
	return p
}

const linearWeightedMovingAverage = (data, n) => {
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		const v = Array(d).fill(0)
		let s = 0
		for (let k = m; k <= i; k++) {
			for (let j = 0; j < d; j++) {
				v[j] += (k - m + 1) * data[k][j]
			}
			s += k - m + 1
		}
		p.push(v.map(a => a / s))
	}
	return p
}

const triangularMovingAverage = (data, k) => {
	const p = simpleMovingAverage(data, k)
	return simpleMovingAverage(p, k)
}

var dispMovingAverage = function(elm, platform) {
	const fitModel = () => {
		const method = elm.select("[name=method]").property("value")
		const k = +elm.select("[name=k]").property("value")
		platform.fit((tx, ty, pred_cb) => {
			let pred = []
			switch (method) {
			case "simple":
				pred = simpleMovingAverage(tx, k)
				break
			case "linear weighted":
				pred = linearWeightedMovingAverage(tx, k)
				break
			case "triangular":
				pred = triangularMovingAverage(tx, k)
				break
			}
			pred_cb(pred)
		})
	}

	elm.append("select")
		.attr("name", "method")
		.on("change", () => {
			fitModel()
		})
		.selectAll("option")
		.data([
			"simple",
			"linear weighted",
			"triangular",
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("k")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Click "Calculate" to update.'
	dispMovingAverage(platform.setting.ml.configElement, platform)
}
