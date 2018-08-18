class DecisionTree {
	constructor(datas, targets) {
		this._datas = datas.map((d, i) => ({
			"value": d,
			"target": targets[i]
		}));
		this._tree = new Tree({
			"datas": this._datas,
			"score": this._gini(this._datas),
			"class": this._maxClasses(this._datas)
		});
		this._features = datas[0].length;
	}

	get depth() {
		return this._tree.depth;
	}

	_maxClasses(datas) {
		let classes = this._countClasses(datas);
		let max_cls = -1;
		let max_n = 0;
		for (let k in classes) {
			if (max_n < classes[k]) {
				max_cls = k;
				max_n = classes[k];
			}
		}
		return max_cls;
	}

	_countClasses(datas) {
		let classes = {};
		datas.forEach(t => {
			classes[t.target] = (classes[t.target] || 0) + 1;
		});
		return classes;
	}

	_gini(datas) {
		let n = datas.length;
		let classes = this._countClasses(datas);
		let j = 1;
		for (let k in classes) {
			let p = classes[k] / n;
			j -= p * p;
		}
		return j;
	}

	fit(depth = 1) {
		let leafs = this._tree.leafs();
		let calc_score = this._gini;
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
					let score = (this._gini(lt) * lt.length + this._gini(rt) * rt.length) / values.length;
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
					"score": this._gini(lt),
					"class": this._maxClasses(lt)
				});
				node.push({
					"datas": rt,
					"score": this._gini(rt),
					"class": this._maxClasses(rt)
				});
			}
		});
	}

	predict(data) {
		return data.map(d => {
			let t = this._tree;
			while (!t.isLeaf()) {
				t = (d[t.value.feature] < t.value.threshold) ? t.at(0) : t.at(1);
			}
			return t.value.class
		});
	}
}

var dispDTree = function(elm) {
	const svg = d3.select("svg");
	svg.insert("g", ":first-child").attr("class", "separation").attr("opacity", 0.5);
	let tree = null;

	const dispRange = function dispRange(root, r) {
		let width = svg.node().getBoundingClientRect().width;
		let height = svg.node().getBoundingClientRect().height;
		r = r || [[0, width], [0, height]];
		if (root.isLeaf()) {
			let max_cls = root.value["class"];
			svg.select(".separation").append("rect")
				.attr("x", r[0][0])
				.attr("y", r[1][0])
				.attr("width", r[0][1] - r[0][0])
				.attr("height", r[1][1] - r[1][0])
				.attr("fill", getCategoryColor(max_cls));
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
		.on("change", () => moveCenters())
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
			svg.select(".separation *").remove();
			if (points.length == 0) {
				tree = null;
				elm.select(".buttons [name=depthnumber]")
					.text("0");
				return;
			}
			tree = new DecisionTree(points.map(p => p.at), points.map(p => p.category))
			dispRange(tree._tree);

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
			dispRange(tree._tree);

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


var decision_tree_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Separate".');
	div.append("div").classed("buttons", true);
	dispDTree(root);

	terminateSetter(() => {
		d3.selectAll("svg .separation").remove();
	});
}
