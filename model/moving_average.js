const simpleMovingAverage = (data, n) => {
	// https://ja.wikipedia.org/wiki/%E7%A7%BB%E5%8B%95%E5%B9%B3%E5%9D%87
	const p = []
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		let v = 0
		for (let k = m; k <= i; k++) {
			v += data[k]
		}
		p.push(v / (i - m + 1))
	}
	return p
}

const linearWeightedMovingAverage = (data, n) => {
	const p = []
	for (let i = 0; i < data.length; i++) {
		const m = Math.max(0, i - n + 1)
		let v = 0
		let s = 0
		for (let k = m; k <= i; k++) {
			v += (k - m + 1) * data[k]
			s += k - m + 1
		}
		p.push(v / s)
	}
	return p
}

const exponentialMovingAverage = (data, k) => {
	const p = [data[0]]
	const alpha = 2 / (k + 1)
	for (let i = 1; i < data.length; i++) {
		p.push(alpha * data[i] + (1 - alpha) * p[i - 1])
	}
	return p
}

const modifiedMovingAverage = (data, k) => {
	const p = [data[0]]
	for (let i = 1; i < data.length; i++) {
		p.push(((k - 1) * p[i - 1] + data[i]) / k)
	}
	return p
}

const triangularMovingAverage = (data, k) => {
	const p = simpleMovingAverage(data, k)
	return simpleMovingAverage(p, k)
}

const cumulativeMovingAverage = (data, k) => {
	const p = []
	let s = 0
	for (let i = 0; i < data.length; i++) {
		s += data[i]
		p.push(s / (i + 1))
	}
	return p
}

var dispMovingAverage = function(elm, platform) {
	const svg = d3.select("svg");

	const fitModel = () => {
		const method = d3.select(".buttons [name=method]").property("value")
		const k = +d3.select(".buttons [name=k]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			let pred = []
			tx = tx.map(v => v[0])
			switch (method) {
			case "simple":
				pred = simpleMovingAverage(tx, k)
				break
			case "linear weighted":
				pred = linearWeightedMovingAverage(tx, k)
				break
			case "exponential":
				pred = exponentialMovingAverage(tx, k)
				break
			case "modified":
				pred = modifiedMovingAverage(tx, k)
				break
			case "triangular":
				pred = triangularMovingAverage(tx, k)
				break
			case "cumulative":
				pred = cumulativeMovingAverage(tx)
				break
			}
			pred_cb(pred)
		})
	}

	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.on("change", () => {
			const method = d3.select(".buttons [name=method]").property("value")
			if (method === "cumulative") {
				kelm.style("display", "none")
			} else {
				kelm.style("display", "inline")
			}
			fitModel()
		})
		.selectAll("option")
		.data([
			"simple",
			"linear weighted",
			"exponential",
			"modified",
			"triangular",
			"cumulative",
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	const kelm = elm.select(".buttons").append("span")
	kelm.append("span")
		.text("k")
	kelm.append("input")
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
