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
		if (config.size) {
			const size = config.size
			binRanges = domain.map(r => {
				const [min, max] = r
				const v = [min]
				let i = 0
				while (min + (++i) * size < max + size) {
					v.push(min + i * size)
				}
				return v
			})
		} else {
			const count = config.count || 10
			binRanges = domain.map(r => {
				const [min, max] = r
				const d = (max - min) / count
				const v = [min]
				for (let i = 1; i < count; i++) {
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
					p.push(0)
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
				ds[k]++
			} else {
				ds = ds[k]
			}
		}
	}
	return dense;
}

var dispHistogram = function(elm, platform) {
	const fitModel = (cb) => {
		const bins = +elm.select("[name=bins]").property("value")
		const width = platform.width;
		const height = platform.height;
		const dim = platform.datas.dimension
		platform.plot(
			(tx, ty, px, pred_cb) => {
				const d = histogram(tx, {
					domain: dim === 1 ? [[0, width]] : [[0, width], [0, height]],
					count: bins
				})

				let pred = Matrix.fromArray(d);
				pred.div(pred.max())
				pred = pred.value.map(specialCategory.density);
				pred_cb(pred);
			}, [width / bins, height / bins], 1
		);
	};

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
