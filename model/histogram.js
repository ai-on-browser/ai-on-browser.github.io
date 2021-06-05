export const histogram = (datas, config = {}) => {
	let binRanges = config.range
	if (!binRanges) {
		let domain = config.domain
		if (!domain) {
			domain = datas[0].map(v => [v, v])
			for (let i = 0; i < datas.length; i++) {
				for (let d = 0; d < datas[i].length; d++) {
					domain[d][0] = Math.min(datas[i][d], domain[d][0])
					domain[d][1] = Math.max(datas[i][d], domain[d][1])
				}
			}
		}
		if (!config.size && !config.count) {
			// https://numpy.org/doc/stable/reference/generated/numpy.histogram_bin_edges.html
			const auto = config.binMethod || 'scott'
			const x = Matrix.fromArray(datas)
			const n = datas.length
			if (auto === 'fd') {
				const iqr = x.quantile(0.75, 0)
				const q1 = x.quantile(0.25, 0)
				iqr.sub(q1)
				config.size = iqr.value.map(v => 2 * v / Math.cbrt(n))
			} else if (auto === 'scott') {
				config.size = x.std(0).value.map(v => v * Math.cbrt(24 * Math.sqrt(Math.PI) / n))
			} else if (auto === 'rice') {
				config.count = 2 * Math.cbrt(n)
			} else if (auto === 'sturges') {
				config.count = Math.log2(n) + 1
			} else if (auto === 'doane') {
				x.sub(x.mean(0))
				x.div(x.std(0))
				x.map(v => v ** 3)
				config.count = 1 + Math.log2(n) + Math.log2(1 + Math.abs(x.mean()) / Math.sqrt(6 * (n - 1) / ((n + 1) * (n + 3))))
			} else if (auto === 'sqrt') {
				config.count = Math.sqrt(n)
			}
		}
		if (config.size) {
			if (!Array.isArray(config.size)) {
				config.size = Array(domain.length).fill(config.size)
			}
			const size = config.size
			binRanges = domain.map((r, k) => {
				const [min, max] = r
				const v = [min]
				let i = 0
				while (min + (++i) * size[k] < max + size[k]) {
					v.push(min + i * size[k])
				}
				return v
			})
		} else {
			config.count = config.count || 10
			if (!Array.isArray(config.count)) {
				config.count = Array(domain.length).fill(config.count)
			}
			const count = config.count
			binRanges = domain.map((r, k) => {
				const [min, max] = r
				const d = (max - min) / count[k]
				const v = [min]
				for (let i = 1; i < count[k]; i++) {
					v.push(min + i * d)
				}
				v.push(max)
				return v
			})
		}
	}

	const dense = []
	let stack = [dense]
	for (let k = 0; k < binRanges.length; k++) {
		const nstack = []
		const l = binRanges[k].length
		for (const p of stack) {
			for (let i = 0; i < l - 1; i++) {
				if (k === binRanges.length - 1) {
					p.push(config.returndata ? [] : 0)
				} else {
					nstack.push(p[i] = [])
				}
			}
		}
		stack = nstack
	}

	for (const data of datas) {
		let ds = dense;
		for (let i = 0; i < data.length; i++) {
			let k = 0
			for (; k < binRanges[i].length - 1; k++) {
				if (data[i] <= binRanges[i][k + 1]) {
					break
				}
			}
			if (i === data.length - 1) {
				if (config.returndata) {
					ds[k].push(data[i])
				} else {
					ds[k]++
				}
			} else {
				ds = ds[k]
			}
		}
	}
	return dense;
}

var dispHistogram = function(elm, platform) {
	const fitModel = (cb) => {
		const method = elm.select("[name=method]").property("value")
		const bins = +elm.select("[name=bins]").property("value")
		const width = platform.width;
		const height = platform.height;
		platform.fit(
			(tx, ty) => {
				const d = histogram(tx, {
					domain: platform.datas.domain,
					count: method !== "manual" ? null : bins,
					binMethod: method
				})

				platform.predict((px, pred_cb) => {
					let pred = Matrix.fromArray(d);
					pred.div(pred.max())
					pred = pred.value.map(specialCategory.density);
					pred_cb(pred);
				}, [width / d.length, height / d[0].length])
			}
		);
	};

	elm.append("select")
		.attr("name", "method")
		.on("change", () => {
			const method = elm.select("[name=method]").property("value")
			elm.select("[name=bins]").property("disabled", method !== "manual")
			fitModel()
		})
		.selectAll("option")
		.data([
			"manual",
			"fd",
			"scott",
			"rice",
			"sturges",
			"doane",
			"sqrt"
		])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text("bins ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "bins")
		.attr("min", 2)
		.attr("value", 10)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispHistogram(platform.setting.ml.configElement, platform);
}
