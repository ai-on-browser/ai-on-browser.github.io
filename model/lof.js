class LOF {
	constructor(k) {
		this._k = k;
	}

	set k(value) {
		this._k = value;
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	predict(datas, threshold) {
		const distances = [];
		const s_distances = [];
		for (let i = 0; i < datas.length; i++) {
			distances[i] = [];
			s_distances[i] = [];
			distances[i][i] = 0;
			s_distances[i][i] = [0, i];
			for (let j = 0; j < i; j++) {
				const d = this._distance(datas[i], datas[j]);
				distances[i][j] = distances[j][i] = d;
				s_distances[i][j] = [d, j];
				s_distances[j][i] = [d, i];
			}
		}
		s_distances.forEach(s => s.sort((a, b) => a[0] - b[0]));
		const nears = a => s_distances[a].slice(1, 1 + this._k);
		const k_distance = p => s_distances[p][this._k][0];
		const reachability_distance = (a, b) => Math.max(k_distance(b), distances[a][b]);
		const lrd = a => 1 / (nears(a).reduce((acc, b) => acc + reachability_distance(a, b[1]), 0) / this._k);
		const lof = a => nears(a).reduce((acc, b) => acc + lrd(b[1]), 0) / this._k / lrd(a);

		const outliers = [];
		datas.forEach((p, i) => {
			outliers.push(lof(i) > threshold)
		});
		return outliers;
	}
}

var dispLOF = function(elm, platform) {
	const mode = platform.task
	let k_value = 5;

	const calcLOF = function() {
		if (mode === 'AD') {
			platform.plot((tx, ty, _, cb) => {
				let model = new LOF(k_value);
				const outliers = model.predict(tx, +elm.select(".buttons [name=threshold]").property("value"));
				cb(outliers)
			})
		} else {
			platform.plot((tx, ty, _, cb) => {
				let model = new LOF(k_value);
				const d = +elm.select(".buttons [name=window]").property("value");
				const data = tx.rolling(d)
				const outliers = model.predict(data, +elm.select(".buttons [name=threshold]").property("value"));
				for (let i = 0; i < d / 2; i++) {
					outliers.unshift(false)
				}
				cb(outliers)
			})
		}
	}

	if (mode === 'CP') {
		elm.select(".buttons")
			.append("span")
			.text(" window = ");
		elm.select(".buttons")
			.append("input")
			.attr("type", "number")
			.attr("name", "window")
			.attr("value", 10)
			.attr("min", 1)
			.attr("max", 100)
			.on("change", function() {
				calcKnn();
			});
	}
	elm.select(".buttons")
		.append("span")
		.text(" k = ");
	elm.select(".buttons")
		.append("select")
		.on("change", function() {
			k_value = +d3.select(this).property("value");
		})
		.property("value", k_value)
		.selectAll("option")
		.data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d)
		.each(function(d) {
			if (d === k_value) {
				d3.select(this).property("selected", true);
			}
		});
	elm.select(".buttons")
		.append("span")
		.text(" threshold = ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 2)
		.attr("min", 0)
		.attr("max", 100)
		.property("required", true)
		.attr("step", 0.1)
		.on("change", function() {
			calcLOF();
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcLOF);
}


var lof_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispLOF(root, platform);
}

export default lof_init
