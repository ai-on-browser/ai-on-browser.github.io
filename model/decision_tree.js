class DecisionTree {
	constructor(datas, targets) {
		this._datas = datas.map((d, i) => ({
			value: d,
			target: targets[i]
		}));
		this._tree = new Tree({
			datas: this._datas,
			value: this._calcValue(this._datas),
			score: this._calcScore(this._datas)
		});
		this._features = datas[0].length;
	}

	get depth() {
		return this._tree.depth;
	}

	fit(depth = 1) {
		let leafs = this._tree.leafs();
		this._tree.scanLeaf(node => {
			let best_score = node.value.score;
			let best_feature = -1;
			let best_threshold = -1;
			for (let i = 0; i < this._features; i++) {
				let values = node.value.datas.map(p => p.value[i]);
				values.sort((a, b) => a - b);
				for (let vidx = 0; vidx < values.length - 1; vidx++) {
					let th = (values[vidx] + values[vidx + 1]) / 2;
					let lt = node.value.datas.filter(p => p.value[i] < th);
					let rt = node.value.datas.filter(p => p.value[i] >= th);
					let score = (this._calcScore(lt) * lt.length + this._calcScore(rt) * rt.length) / values.length;
					if (score < best_score) {
				 		best_score = score;
						best_feature = i;
						best_threshold = th;
					}
				}
			}
			if (best_score < node.value.score) {
				node.value.feature = best_feature;
				node.value.threshold = best_threshold;
				let lt = node.value.datas.filter(p => p.value[best_feature] < best_threshold);
				let rt = node.value.datas.filter(p => p.value[best_feature] >= best_threshold);
				node.push({
					datas: lt,
					score: this._calcScore(lt),
					value: this._calcValue(lt)
				});
				node.push({
					datas: rt,
					score: this._calcScore(rt),
					value: this._calcValue(rt)
				});
			}
		});
	}

	predict_value(data) {
		return data.map(d => {
			let t = this._tree;
			while (!t.isLeaf()) {
				t = (d[t.value.feature] < t.value.threshold) ? t.at(0) : t.at(1);
			}
			return t.value.value
		});
	}
}

export class DecisionTreeClassifier extends DecisionTree {
	constructor(datas, targets) {
		super(datas, targets);
	}

	_calcValue(datas) {
		return this._classesRate(datas);
	}

	_calcScore(datas) {
		return this._gini(datas);
	}

	_classesRate(datas) {
		let classes = new Map();
		datas.forEach(t => {
			classes.set(t.target, (classes.get(t.target) || 0) + 1);
		});
		classes.forEach((v, k) => {
			classes.set(k, v /= datas.length);
		});
		return classes;
	}

	_gini(datas) {
		let cr = this._classesRate(datas);
		let j = 1;
		cr.forEach(v => j -= v ** 2);
		return j;
	}

	predict_prob(data) {
		return this.predict_value(data);
	}

	predict(data) {
		let prob = this.predict_prob(data);
		return prob.map(d => {
			let max_c = 0, max_cls = -1;
			d.forEach((v, k) => {
				if (v > max_c) {
					max_c = v;
					max_cls = k;
				}
			});
			return max_cls;
		});
	}
}

export class DecisionTreeRegression extends DecisionTree {
	constructor(datas, targets) {
		super(datas, targets);
	}

	_calcValue(datas) {
		if (datas.length === 0) return 0
		if (Array.isArray(datas[0].target)) {
			const dim = datas[0].target.length
			return datas.reduce((acc, d) => acc.map((v, i) => v + d.target[i]), Array(dim).fill(0)).map(v => v / datas.length)
		} else {
			return datas.reduce((acc, d) => acc + d.target, 0) / datas.length;
		}
	}

	_calcScore(datas) {
		if (datas.length === 0) return 0
		const m = this._calcValue(datas);
		if (Array.isArray(datas[0].target)) {
			return Math.sqrt(datas.reduce((acc, d) => acc + d.target.reduce((s, v, i) => s + (v - m[i]) ** 2, 0), 0) / datas.length);
		} else {
			return Math.sqrt(datas.reduce((acc, d) => acc + (d.target - m) ** 2, 0) / datas.length);
		}
	}

	predict(data) {
		return this.predict_value(data);
	}
}

class DecisionTreePlotter {
	constructor(platform) {
		this._platform = platform
		this._mode = platform.task
		this._svg = platform.svg;
		this._r = null;
		this._lineEdge = []
	}

	remove() {
		this._svg.select(".separation").remove();
	}

	plot(tree) {
		this._svg.select(".separation").remove();
		if (this._platform.datas.length == 0) {
			return
		}
		if (this._platform.datas.dimension === 1) {
			this._r = this._svg.insert("g").attr("class", "separation");
		} else {
			this._r = this._svg.insert("g", ":first-child").attr("class", "separation").attr("opacity", 0.5);
		}
		this._lineEdge = []
		this._dispRange(tree._tree)
		if (this._platform.datas.dimension === 1) {
			const line = d3.line().x(d => d[0]).y(d => d[1]);
			this._r.append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(this._lineEdge));
		}
	}

	_dispRange(root, r) {
		let width = this._platform.width;
		let height = this._platform.height;
		r = r || [[0, width], [0, height]];
		if (root.isLeaf()) {
			const sep = this._r;
			let max_cls = 0, max_v = 0;
			if (this._mode === "CF") {
				root.value["value"].forEach((v, k) => {
					if (v > max_v) {
						max_v = v;
						max_cls = k;
					}
				});
			} else {
				max_cls = root.value["value"];
			}
			if (this._platform.datas.dimension === 1) {
				this._lineEdge.push([r[0][0], max_cls])
				this._lineEdge.push([r[0][1], max_cls])
			} else {
				sep.append("rect")
					.attr("x", r[0][0])
					.attr("y", r[1][0])
					.attr("width", r[0][1] - r[0][0])
					.attr("height", r[1][1] - r[1][0])
					.attr("fill", getCategoryColor(max_cls));
			}
		} else {
			root.forEach((n, i) => {
				let r0 = [[].concat(r[0]), [].concat(r[1])];
				let mm = (i == 0) ? 1 : 0;
				r0[root.value["feature"]][mm] = root.value["threshold"];
				this._dispRange(n, r0)
			});
		}
	};

}

var dispDTree = function(elm, platform) {
	const mode = platform.task
	const plotter = new DecisionTreePlotter(platform)
	let tree = null;

	const dispRange = function() {
		if (platform.datas.dimension <= 2) {
			plotter.plot(tree);
		} else {
			platform.plot(
				(tx, ty, px, pred_cb) => {
					let pred = tree.predict(px);
					pred_cb(pred);
				},
				2,
				1
			);
		}
	};

	elm.append("select")
		.selectAll("option")
		.data([
			{
				"value": "CART",
			}
		])
		.enter()
		.append("option")
		.attr("value", d => d["value"])
		.text(d => d["value"]);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			platform.datas.scale = 1
			if (mode == "CF") {
				tree = new DecisionTreeClassifier(platform.datas.x, platform.datas.y)
			} else {
				tree = new DecisionTreeRegression(platform.datas.x, platform.datas.y)
			}
			dispRange()

			elm.select("[name=depthnumber]")
				.text(tree.depth);
		});
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Separate")
		.on("click", () => {
			if (!tree) {
				return;
			}
			tree.fit();

			dispRange()

			elm.select("[name=depthnumber]")
				.text(tree.depth);
		});
	elm.append("span")
		.attr("name", "depthnumber")
		.text("0");
	elm.append("span")
		.text(" depth ");

	return () => {
		plotter.remove()
	}
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Next, click "Initialize". Finally, click "Separate".'
	platform.setting.terminate = dispDTree(platform.setting.ml.configElement, platform);
}
