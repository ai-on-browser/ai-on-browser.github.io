class DBSCAN {
	// https://ja.wikipedia.org/wiki/DBSCAN
	constructor(eps = 0.5, minPts = 5, metric = 'euclid') {
		this._eps = eps;
		this._minPts = minPts;

		this._metric = metric
		switch (this._metric) {
		case 'euclid':
			this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
			break
		case 'manhattan':
			this._d = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0)
			break
		case 'chebyshev':
			this._d = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])))
			break;
		}
	}

	predict(datas) {
		let c = 0;
		const n = datas.length;
		const visited = Array(n).fill(false);
		const cluster = Array(n);
		const d = Array(n);
		for (let i = 0; i < n; d[i++] = Array(n));
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				const v = this._d(datas[i], datas[j]);
				d[i][j] = d[j][i] = v;
			}
		}
		const getNeighbors = (i) => {
			const neighbors = [];
			for (let k = 0; k < n; k++) {
				if (d[i][k] < this._eps) neighbors.push(k);
			}
			return neighbors
		}
		for (let i = 0; i < n; i++) {
			if (visited[i]) continue;
			visited[i] = true;
			const neighbors = getNeighbors(i);
			if (neighbors.length < this._minPts) {
				cluster[i] = -1;
				continue;
			}
			const clst = c++;
			cluster[i] = clst;
			while(neighbors.length > 0) {
				const k = neighbors.pop();
				if (!visited[k]) {
					visited[k] = true
					const ns = getNeighbors(k);
					if (ns.length >= this._minPts) {
						neighbors.push(...ns);
					}
				}
				if (!cluster[k]) cluster[k] = clst;
			}
		}
		return cluster;
	}
}

var dispDBSCAN = function(elm, platform) {
	const svg = platform.svg;
	svg.insert("g", ":first-child").attr("class", "range").attr("opacity", 0.4);

	const fitModel = (cb) => {
		svg.selectAll(".range *").remove();
		platform.fit(
			(tx, ty, pred_cb) => {
				const metric = elm.select("[name=metric]").property("value")
				const eps = +elm.select("[name=eps]").property("value")
				const minpts = +elm.select("[name=minpts]").property("value")
				const model = new DBSCAN(eps, minpts, metric)
				const pred = model.predict(tx);
				pred_cb(pred.map(v => v + 1))
				elm.select("[name=clusters]").text(new Set(pred).size);
				const scale = 1000;

				if (metric === 'euclid') {
					svg.select(".range")
						.selectAll("circle")
						.data(tx)
						.enter()
						.append("circle")
						.attr("cx", c => c[0] * scale)
						.attr("cy", c => c[1] * scale)
						.attr("r", eps * scale)
						.attr("fill-opacity", 0)
						.attr("stroke", (c, i) => getCategoryColor(pred[i] + 1))
				} else if (metric === 'manhattan') {
					svg.select(".range")
						.selectAll("polygon")
						.data(tx)
						.enter()
						.append("polygon")
						.attr("points", c => {
							const x0 = c[0] * scale
							const y0 = c[1] * scale
							const d = eps * scale
							return `${x0 - d},${y0} ${x0},${y0 - d} ${x0 + d},${y0} ${x0},${y0 + d}`
						})
						.attr("fill-opacity", 0)
						.attr("stroke", (c, i) => getCategoryColor(pred[i] + 1))
				} else if (metric === 'chebyshev') {
					svg.select(".range")
						.selectAll("rect")
						.data(tx)
						.enter()
						.append("rect")
						.attr("x", c => (c[0] - eps) * scale)
						.attr("y", c => (c[1] - eps) * scale)
						.attr("width", eps * 2 * scale)
						.attr("height", eps * 2 * scale)
						.attr("fill-opacity", 0)
						.attr("stroke", (c, i) => getCategoryColor(pred[i] + 1))
				}
				cb && cb()
			}
		);
	}

	elm.append("select")
		.attr("name", "metric")
		.on("change", fitModel)
		.selectAll("option")
		.data([
			"euclid",
			"manhattan",
			"chebyshev"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("eps")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "eps")
		.attr("min", 0.01)
		.attr("max", 10)
		.attr("step", 0.01)
		.attr("value", 0.05)
		.on("change", fitModel);
	elm.append("span")
		.text("min pts")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "minpts")
		.attr("min", 2)
		.attr("max", 1000)
		.attr("value", 5)
		.on("change", fitModel);
	const stepButton = elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	elm.append("span")
		.text(" Clusters: ");
	elm.append("span")
		.attr("name", "clusters");
	return () => {
		svg.select(".range").remove();
	}
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispDBSCAN(platform.setting.ml.configElement, platform);
}
