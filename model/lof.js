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

	predict(datas) {
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

		return datas.map((p, i) => lof(i));
	}
}

var dispLOF = function(elm, platform) {
	const mode = platform.task
	let k_value = 5;

	const calcLOF = function() {
		const threshold = +elm.select("[name=threshold]").property("value")
		let model = new LOF(k_value);
		if (mode === 'AD') {
			platform.plot((tx, ty, _, cb) => {
				const pred = model.predict(tx);
				cb(pred.map(v => v > threshold))
			})
		} else {
			platform.plot((tx, ty, _, cb) => {
				const d = +elm.select("[name=window]").property("value");
				const data = tx.rolling(d)
				const pred = model.predict(data);
				for (let i = 0; i < d / 2; i++) {
					pred.unshift(1)
				}
				cb(pred, threshold)
			})
		}
	}

	if (mode === 'CP') {
		elm.append("span")
			.text(" window = ");
		elm.append("input")
			.attr("type", "number")
			.attr("name", "window")
			.attr("value", 10)
			.attr("min", 1)
			.attr("max", 100)
			.on("change", function() {
				calcLOF();
			});
	}
	elm.append("span")
		.text(" k = ");
	elm.append("input")
		.attr("type", "number")
		.attr("value", k_value)
		.attr("min", 1)
		.attr("max", 10)
		.on("change", function() {
			k_value = +d3.select(this).property("value");
		})
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
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
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcLOF);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispLOF(platform.setting.ml.configElement, platform)
}
