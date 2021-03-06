class CURE {
	// https://en.wikipedia.org/wiki/CURE_algorithm
	// http://ibisforest.org/index.php?CURE
	constructor(c) {
		this._c = c
		this._a = 0.2
		this._root = null
	}

	_distance(a, b) {
		return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	fit(data) {
		this._root = new Tree()
		const distances = []
		data.forEach((v, i) => {
			this._root.push({
				point: v,
				index: i,
				repr: [v],
				distance: 0
			})
			distances[i] = data.map(p => this._distance(v, p))
		})

		while (this._root.length > 1) {
			let min_i = 0
			let min_j = 1
			let min_v = Infinity
			const n = this._root.length
			for (let i = 0; i < n; i++) {
				for (let j = i + 1; j < n; j++) {
					if (distances[i][j] < min_v) {
						min_i = i
						min_j = j
						min_v = distances[i][j]
					}
				}
			}

			const i_datas = this._root.at(min_i).leafValues().map(v => v.point)
			const j_datas = this._root.at(min_j).leafValues().map(v => v.point)
			const new_datas = [...i_datas, ...j_datas]
			const repr_idx = []

			let pre_i = Math.floor(Math.random() * new_datas.length)
			for (let i = 0; i < Math.min(new_datas.length, this._c); i++) {
				let max_d = 0
				let max_i = -1
				for (let k = 0; k < new_datas.length; k++) {
					if (repr_idx.indexOf(k) >= 0) {
						continue
					}
					const d = this._distance(new_datas[k], new_datas[pre_i])
					if (d > max_d) {
						max_d = d
						max_i = k
					}
				}
				repr_idx.push(max_i)
				pre_i = max_i
			}

			const repr = []
			const mean = Matrix.fromArray(new_datas).mean(0).value
			for (let i = 0; i < repr_idx.length; i++) {
				repr[i] = new_datas[repr_idx[i]].concat()
				for (let d = 0; d < mean.length; d++) {
					repr[i][d] = this._a * mean[d] + (1 - this._a) * repr[i][d]
				}
			}

			for (let i = 0; i < n; i++) {
				if (i === min_i || i === min_j) {
					distances[min_i][i] = 0
					continue
				}
				let md = Infinity
				const iv = this._root.at(i).value
				for (let s = 0; s < iv.repr.length; s++) {
					for (let t = 0; t < repr.length; t++) {
						const d = this._distance(iv.repr[s], repr[t])
						if (d < md) {
							md = d
						}
					}
				}
				distances[i][min_i] = distances[min_i][i] = md
				distances[i].splice(min_j, 1)
			}
			distances[min_i].splice(min_j, 1)
			distances.splice(min_j, 1)
			this._root.set(min_i, new Tree({
				repr: repr,
				distance: min_v
			}, [this._root.at(min_i), this._root.at(min_j)]))
			this._root.removeAt(min_j)
		}
		this._root = this._root.at(0);
	}

	getClusters(number) {
		const scanNodes = [this._root]
		while (scanNodes.length < number) {
			let max_distance = 0;
			let max_distance_idx = -1;
			for (let i = 0; i < scanNodes.length; i++) {
				const node = scanNodes[i];
				if (!node.isLeaf() && node.value.distance > max_distance) {
					max_distance_idx = i;
					max_distance = node.value.distance
				}
			}
			if (max_distance_idx === -1) {
				break
			}
			const max_distance_node = scanNodes[max_distance_idx];
			scanNodes.splice(max_distance_idx, 1, max_distance_node.at(0), max_distance_node.at(1))
		}
		return scanNodes;
	}

	predict(k) {
		const p = []
		const clusters = this.getClusters(k)
		for (let i = 0; i < clusters.length; i++) {
			const leafs = clusters[i].leafValues()
			for (let k = 0; k < leafs.length; k++) {
				p[leafs[k].index] = i
			}
		}
		return p
	}
}

var dispCURE = function(elm, platform) {
	let epoch = 0

	const fitModel = () => {
		platform.fit(
			(tx, ty, pred_cb) => {
				const c = +elm.select("[name=c]").property("value")
				const k = +elm.select("[name=k]").property("value")
				const model = new CURE(c)
				model.fit(tx)
				const pred = model.predict(k)
				pred_cb(pred.map(v => v + 1))
			}
		);
	}

	elm.append("span")
		.text(" c ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "c")
		.attr("min", 1)
		.attr("max", 1000)
		.attr("value", 10)
	elm.append("span")
		.text(" k ")
	elm.append("input")
		.attr("type", "number")
		.attr("name", "k")
		.attr("min", 1)
		.attr("max", 100)
		.attr("value", 3)
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => {
			fitModel()
		});
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispCURE(platform.setting.ml.configElement, platform)
}

