const simpleMovingAverage = (data, n) => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = []
	const d = data[0].length
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		const v = Array(d).fill(0)
		for (let k = m; k <= i; k++) {
			for (let j = 0; j < d; j++) {
				v[j] += data[k][j]
			}
		}
		p.push(v.map(a => a / (i - m + 1)))
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
		const method = elm.select(".buttons [name=method]").property("value")
		const k = +elm.select(".buttons [name=k]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
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

	elm.select(".buttons")
		.append("select")
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
	elm.select(".buttons")
		.append("span")
		.text("k")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 5)
		.on("change", fitModel)
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", fitModel);
}


var moving_average_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Click "Calculate" to update.');
	div.append("div").classed("buttons", true);
	dispMovingAverage(root, platform);
}

export default moving_average_init
