class DBSCAN {
	// https://ja.wikipedia.org/wiki/DBSCAN
	constructor(eps, minPts) {
		this._epoch = 0;
		this._eps = eps;
		this._minPts = minPts;
	}

	get epoch() {
		return this._epoch
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
				const v = Math.sqrt(datas[i].reduce((s, v, k) => s + (v - datas[j][k]) ** 2, 0));
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
				visited[k] = true
				if (!visited[k]) {
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

var dispDBSCAN = function(elm) {
	const svg = d3.select("svg");
	svg.insert("g", ":first-child").attr("class", "circle").attr("opacity", 0.4);

	const fitModel = (cb) => {
		svg.selectAll(".circle *").remove();
		FittingMode.CT.fit(svg, points, 4,
			(tx, ty, px, pred_cb) => {
				const eps = +elm.select(".buttons [name=eps]").property("value")
				const minpts = +elm.select(".buttons [name=minpts]").property("value")
				const model = new DBSCAN(eps, minpts)
				const pred = model.predict(tx);
				pred_cb(pred.map(v => v + 1))

				svg.select(".circle")
					.selectAll("circle")
					.data(tx)
					.enter()
					.append("circle")
					.attr("cx", c => c[0] * 1000)
					.attr("cy", c => c[1] * 1000)
					.attr("r", eps * 1000)
					.attr("fill-opacity", 0)
					.attr("stroke", (c, i) => getCategoryColor(pred[i] + 1))
				cb && cb()
			},
		);
	}

	elm.select(".buttons")
		.append("span")
		.text("eps")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "eps")
		.attr("min", 0.01)
		.attr("max", 10)
		.attr("step", 0.01)
		.attr("value", 0.2)
		.on("change", fitModel);
	elm.select(".buttons")
		.append("span")
		.text("min pts")
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "minpts")
		.attr("min", 2)
		.attr("max", 1000)
		.attr("value", 10)
		.on("change", fitModel);
	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	return () => {
		d3.selectAll("svg .circle").remove();
	}
}


var dbscan_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Step" button repeatedly.');
	div.append("div").classed("buttons", true);
	let termCallback = dispDBSCAN(root);

	setting.setTerminate(() => {
		termCallback();
	});
}
