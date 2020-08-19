class DecisionTree {
	constructor(datas, targets) {
		this._datas = datas.map((d, i) => ({
			"value": d,
			"target": targets[i]
		}));
		this._tree = new Tree({
			"datas": this._datas,
			"value": this._calcValue(this._datas),
			"score": this._calcScore(this._datas)
		});
		this._features = datas[0].length;
	}

	get depth() {
		return this._tree.depth;
	}

	fit(depth = 1) {
		let leafs = this._tree.leafs();
		this._tree.scanLeaf(node => {
			let best_score = node.value["score"];
			let best_feature = -1;
			let best_threshold = -1;
			for (let i = 0; i < this._features; i++) {
				let values = node.value["datas"].map(p => p.value[i]);
				values.sort((a, b) => a - b);
				for (let vidx = 0; vidx < values.length - 1; vidx++) {
					let th = (values[vidx] + values[vidx + 1]) / 2;
					let lt = node.value["datas"].filter(p => p.value[i] < th);
					let rt = node.value["datas"].filter(p => p.value[i] >= th);
					let score = (this._calcScore(lt) * lt.length + this._calcScore(rt) * rt.length) / values.length;
					if (score < best_score) {
				 		best_score = score;
						best_feature = i;
						best_threshold = th;
					}
				}
			}
			if (best_score < node.value["score"]) {
				node.value["feature"] = best_feature;
				node.value["threshold"] = best_threshold;
				let lt = node.value["datas"].filter(p => p.value[best_feature] < best_threshold);
				let rt = node.value["datas"].filter(p => p.value[best_feature] >= best_threshold);
				node.push({
					"datas": lt,
					"score": this._calcScore(lt),
					"value": this._calcValue(lt)
				});
				node.push({
					"datas": rt,
					"score": this._calcScore(rt),
					"value": this._calcValue(rt)
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
		return datas.reduce((acc, d) => acc + d.target, 0) / datas.length;
	}

	_calcScore(datas) {
		const m = this._calcValue(datas);
		return Math.sqrt(datas.reduce((acc, d) => acc + (d.target - m) ** 2, 0) / datas.length);
	}

	predict(data) {
		return this.predict_value(data);
	}
}

var dispDTree = function(elm, mode, setting, platform) {
	const svg = d3.select("svg");
	svg.insert("g", ":first-child").attr("class", "separation").attr("opacity", 0.5);
	let tree = null;
	const line = d3.line().x(d => d[0]).y(d => d[1]);
	let lineEdge = [];

	const dispRange = function dispRange(root, r) {
		let width = svg.node().getBoundingClientRect().width;
		let height = svg.node().getBoundingClientRect().height;
		r = r || [[0, width], [0, height]];
		if (root.isLeaf()) {
			const sep = svg.select(".separation");
			let max_cls = 0, max_v = 0;
			if (mode == "CF") {
				root.value["value"].forEach((v, k) => {
					if (v > max_v) {
						max_v = v;
						max_cls = k;
					}
				});
			} else {
				max_cls = root.value["value"];
			}
			if (setting.dimension === 1) {
				lineEdge.push([r[0][0], max_cls])
				lineEdge.push([r[0][1], max_cls])
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
				dispRange(n, r0)
			});
		}
	};

	elm.select(".buttons")
		.append("select")
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
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			svg.select(".separation").remove();
			if (setting.dimension === 1) {
				svg.insert("g").attr("class", "separation");
			} else {
				svg.insert("g", ":first-child").attr("class", "separation").attr("opacity", 0.5);
			}
			if (platform.datas.length == 0) {
				tree = null;
				elm.select(".buttons [name=depthnumber]")
					.text("0");
				return;
			}
			if (mode == "CF") {
				tree = new DecisionTreeClassifier(platform.datas.x, platform.datas.y)
			} else {
				if (setting.dimension === 1) {
					tree = new DecisionTreeRegression(platform.datas.x.map(p => [p[0]]), platform.datas.x.map(p => p[1]))
				} else {
					tree = new DecisionTreeRegression(platform.datas.x, platform.datas.y)
				}
			}
			lineEdge = [];
			dispRange(tree._tree);

			if (setting.dimension === 1) {
				svg.select(".separation").append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(lineEdge));
			}

			elm.select(".buttons [name=depthnumber]")
				.text(tree.depth);
		});
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Separate")
		.on("click", () => {
			if (!tree) {
				return;
			}
			tree.fit();

			svg.selectAll(".separation *").remove();
			lineEdge = [];
			dispRange(tree._tree);
			if (setting.dimension === 1) {
				svg.select(".separation").append("path").attr("stroke", "black").attr("fill-opacity", 0).attr("d", line(lineEdge));
			}

			elm.select(".buttons [name=depthnumber]")
				.text(tree.depth);
		});
	elm.select(".buttons")
		.append("span")
		.attr("name", "depthnumber")
		.text("0");
	elm.select(".buttons")
		.append("span")
		.text(" depth ");
}

var decision_tree_init = function(platform) {
	const root = platform.setting.ml.configElement
	const mode = platform.task
	const setting = platform.setting
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Separate".');
	div.append("div").classed("buttons", true);
	dispDTree(root, mode, setting, platform);

	setting.terminate = () => {
		d3.selectAll("svg .separation").remove();
	};
}

export default decision_tree_init

