class DecisionTreeSub {
	constructor(datas, targets) {
		this._datas = datas.map((d, i) => ({
			"value": d,
			"target": targets[i]
		}));
		this._tree = new Tree({
			"datas": this._datas,
			"score": this._gini(this._datas),
			"class": this._classesRate(this._datas)
		});
		this._features = datas[0].length;
	}

	get depth() {
		return this._tree.depth;
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
		let n = datas.length;
		let cr = this._classesRate(datas);
		let j = 1;
		cr.forEach(v => j -= v ** 2);
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
					"class": this._classesRate(lt)
				});
				node.push({
					"datas": rt,
					"score": this._gini(rt),
					"class": this._classesRate(rt)
				});
			}
		});
	}

	predict_prob(data) {
		return data.map(d => {
			let t = this._tree;
			while (!t.isLeaf()) {
				t = (d[t.value.feature] < t.value.threshold) ? t.at(0) : t.at(1);
			}
			return t.value.class
		});
	}

	predict(data) {
		let prob = this.predict_prob(data);
		return prob.map(d => {
			let max_c = 0;
			let max_cls = -1;
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

class RandomForest {
	// see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%95%E3%82%A9%E3%83%AC%E3%82%B9%E3%83%88
	constructor(datas, targets, tree_num, sampling_rate = 0.8) {
		this._trees = [];
		let en = Math.ceil(datas.length * sampling_rate);
		let idx = [];
		for (let i = 0; i < datas.length; idx.push(i++));
		for (let i = 0; i < tree_num; i++) {
			shuffle(idx);
			let tdata = [];
			let ttarget = [];
			for (let k = 0; k < en; k++) {
				tdata.push(datas[idx[k]]);
				ttarget.push(targets[idx[k]]);
			}
			this._trees.push(new DecisionTreeSub(tdata, ttarget));
		}
	}

	get depth() {
		return Math.max(...this._trees.map(t => t.depth));
	}

	fit(depth = 1) {
		console.time("prob");
		this._trees.forEach(t => t.fit(depth));
		console.timeEnd("prob");
	}

	predict_prob(datas) {
		let preds = this._trees.map(t => t.predict_prob(datas));
		let ret = [];
		console.time("pred");
		for (let i = 0; i < datas.length; i++) {
			let prob = new Map();
			for (let n = 0; n < preds.length; n++) {
				let p = preds[n][i];
				p.forEach((v, k) => {
					prob.set(k, (prob.get(k) || 0) + v);
				});
			}
			prob.forEach((v, k) => {
				prob.set(k, v / preds.length);
			});
			ret.push(prob);
		}
		console.timeEnd("pred");
		return ret;
	}

	predict(datas) {
		let prob = this.predict_prob(datas);
		return prob.map(d => {
			let max_c = 0;
			let max_cls = -1;
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

var dispRandomForest = function(elm) {
	const svg = d3.select("svg");
	let tileLayer = svg.insert("g", ":first-child").attr("class", "separation").attr("opacity", 0.5);
	let tree = null;
	let tileSize = 4;

	const dispRange = function() {
		let width = svg.node().getBoundingClientRect().width;
		let height = svg.node().getBoundingClientRect().height;

		let datas = [];
		for (let i = 0; i < height; i += tileSize) {
			for (let j = 0; j < width; j += tileSize) {
				datas.push([j + tileSize / 2, i + tileSize / 2]);
			}
		}

		let pred = tree.predict(datas);

		let categories = [];
		let n = 0;
		for (let i = 0; i < height / tileSize; i++) {
			categories[i] = [];
			for (let j = 0; j < width / tileSize; j++) {
				categories[i][j] = pred[n++];
			}
		}

		new DataHulls(tileLayer, categories, tileSize);
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
		.append("span")
		.text(" Tree #");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "tree_num")
		.property("value", 10)
		.attr("min", 1)
		.attr("max", 100);
	elm.select(".buttons")
		.append("span")
		.text(" Sampling rate ");
	elm.select(".buttons")
		.append("input")
		.attr("type", "number")
		.attr("name", "srate")
		.property("value", 0.8)
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1);
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
			const tree_num = +elm.select("input[name=tree_num]").property("value");
			const srate = +elm.select("input[name=srate]").property("value");
			tree = new RandomForest(points.map(p => p.at), points.map(p => p.category), tree_num, srate);
			dispRange();

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
			dispRange();

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


var random_forest_init = function(root, terminateSetter) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Initialize". Finally, click "Separate".');
	div.append("div").classed("buttons", true);
	dispRandomForest(root);

	terminateSetter(() => {
		d3.selectAll("svg .separation").remove();
	});
}
