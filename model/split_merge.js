class SplitAndMerge {
	// https://en.wikipedia.org/wiki/Split_and_merge_segmentation
	constructor(method = "variance", threshold = 0.1) {
		this._method = method
		this._threshold = threshold
	}

	_shouldSplit(data) {
		data = Matrix.fromArray(data.flat())
		if (this._method === "variance") {
			const variance = data.variance(0).mean()
			if (variance > this._threshold) {
				return true
			}
		} else if (this._method === "uniformity") {
			const mean = data.mean(1)
			mean.sub(mean.mean())
			mean.map(Math.abs)
			if (mean.max() > this._threshold) {
				return true
			}
		}
		return false
	}

	predict(x) {
		this._x = x

		let category = 0
		const tree = new Tree({
			data: x,
			category: category++,
			range: [[0, x.length], [0, x[0].length]]
		})
		const stack = [tree]
		while (stack.length > 0) {
			const node = stack.pop()
			const xd = node.value.data
			if (xd.length <= 1 || xd[0].length <= 1) {
				continue
			}
			const range = node.value.range

			if (this._shouldSplit(xd)) {
				const n = range.map(r => r[1] - r[0])
				const c = n.map(v => Math.floor(v / 2))
				const r = []
				for (let i = 0; i < 2 ** n.length; i++) {
					const p = i.toString(2).padStart(n.length, '0').split('').map(v => !!+v)
					r.push(p.map((v, i) => v ? [0, c[i]] : [c[i], n[i]]))
				}

				for (const [r1, r2] of r) {
					const d = []
					for (let i = r1[0]; i < r1[1]; i++) {
						const dr = []
						for (let j = r2[0]; j < r2[1]; j++) {
							dr.push(xd[i][j])
						}
						d.push(dr)
					}
					const child = new Tree({
						data: d,
						category: category++,
						range: [[range[0][0] + r1[0], range[0][0] + r1[1]], [range[1][0] + r2[0], range[1][0] + r2[1]]]
					})
					node.push(child)
					stack.push(child)
				}
			}
		}

		const segments = tree.leafValues()
		for (let i = 0; i < segments.length; i++) {
			const range = segments[i].range
			for (let j = 0; j < segments.length; j++) {
				if (segments[i].category === segments[j].category) {
					continue
				}
				const r = segments[j].range
				let adjust = false
				for (let k = 0; k < r.length; k++) {
					if (r[k][0] === range[k][1] || r[k][1] === range[k][0]) {
						if (r.every((v, d) => d === k || (r[d][0] < range[d][1] && range[d][0] < r[d][1]))) {
							adjust = true
						}
					}
				}

				if (!adjust) {
					continue
				}

				const segs = segments.filter(s => s.category === segments[i].category || s.category === segments[j].category)
				const data = []
				for (const seg of segs) {
					data.push(...seg.data.flat())
				}

				if (!this._shouldSplit(data)) {
					const c = Math.min(segments[i].category, segments[j].category)
					for (const seg of segs) {
						seg.category = c
					}
				}
			}
		}

		const pred = []
		for (let i = 0; i < this._x.length; pred[i++] = []);
		tree.scanLeaf(node => {
			const r = node.value.range
			for (let i = r[0][0]; i < r[0][1]; i++) {
				for (let j = r[1][0]; j < r[1][1]; j++) {
					pred[i][j] = node.value.category
				}
			}
		})
		return pred.flat()
	}
}

var dispSAM = function(elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const method = elm.select("[name=method]").property("value")
			const th = +elm.select("[name=threshold]").property("value")
			const model = new SplitAndMerge(method, th)
			let y = model.predict(tx)
			pred_cb(y)
		}, 4);
	}

	elm.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["uniformity", "variance"])
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 10)
		.attr("min", 0)
		.attr("max", 100)
		.attr("step", 0.1)
		.on("change", fitModel)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", fitModel);
}

export default function(platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSAM(platform.setting.ml.configElement, platform);
}
