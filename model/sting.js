class STING {
	// https://en.wikipedia.org/wiki/Cluster_analysis
	// "STING : A Statistical Information Grid Approach to Spatial Data Mining"
	constructor(ranges) {
		this._cells = null
	}

	fit(datas) {
		const n = datas.length
		const dim = datas[0].length
		const mins = datas.reduce((m, d) => m.map((v, i) => Math.min(v, d[i])), Array(dim).fill(Infinity))
		const maxs = datas.reduce((m, d) => m.map((v, i) => Math.max(v, d[i])), Array(dim).fill(-Infinity))
		const ranges = mins.map((m, i) => [m, maxs[i]]);
		this._cells = new Tree({
			ranges: ranges
		})
		let stack = [this._cells]
		const spl_size = 2 ** dim
		const max_depth = Math.log(n / 20) / Math.log(spl_size)
		for (let a = 0; a < max_depth; a++) {
			const new_stack = []
			for (const c of stack) {
				const rng = c.value.ranges;
				for (let i = 0; i < spl_size; i++) {
					let p = i;
					const r = [];
					for (let k = 0; k < rng.length; k++) {
						const m = (rng[k][1] - rng[k][0]) / 2
						if (p % 2 === 0) {
							r.push([rng[k][0], m])
						} else {
							r.push([m, rng[k][1]])
						}
						p = Math.floor(p / 2)
					}
					const t = new Tree({
						ranges: r
					})
					new_stack.push(t);
					c.push(t)
				}
			}
		}
	}

	predict(datas) {
	}
}

var dispSTING = function(elm) {

	const fitModel = (cb) => {
		FittingMode.CT.fit(svg, points, 4,
			(tx, ty, px, pred_cb) => {
				const model = new STING()
				model.fit(tx)
				const pred = model.predict(tx);
				pred_cb(pred.map(v => v + 1))
				elm.select(".buttons [name=clusters]").text(new Set(pred).size);
				cb && cb()
			},
		);
	}

	const stepButton = elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel)
	elm.select(".buttons")
		.append("span")
		.text(" Clusters: ");
	elm.select(".buttons")
		.append("span")
		.attr("name", "clusters");
	return () => {
	}
}


var sting_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Fit" button.');
	div.append("div").classed("buttons", true);
	let termCallback = dispSTING(root);

	setting.terminate = termCallback;
}
