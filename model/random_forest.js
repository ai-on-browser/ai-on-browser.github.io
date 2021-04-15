import { DecisionTreeClassifier, DecisionTreeRegression } from './decision_tree.js'

class RandomForest {
	// see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%B3%E3%83%80%E3%83%A0%E3%83%95%E3%82%A9%E3%83%AC%E3%82%B9%E3%83%88
	constructor(tree_num, sampling_rate = 0.8, tree_class = DecisionTreeClassifierSub) {
		this._trees = [];
		this._treenum = tree_num
		this._samplingRate = sampling_rate
		this._treeclass = tree_class
	}

	get depth() {
		return Math.max(...this._trees.map(t => t.depth));
	}

	init(datas, targets) {
		this._trees = [];
		let en = Math.ceil(datas.length * this._samplingRate);
		let idx = [];
		for (let i = 0; i < datas.length; idx.push(i++));
		for (let i = 0; i < this._treenum; i++) {
			shuffle(idx);
			let tdata = [];
			let ttarget = [];
			for (let k = 0; k < en; k++) {
				tdata.push(datas[idx[k]]);
				ttarget.push(targets[idx[k]]);
			}
			const tree = new this._treeclass()
			tree.init(tdata, ttarget)
			this._trees.push(tree);
		}
	}

	fit(depth = 1) {
		this._trees.forEach(t => t.fit(depth));
	}

	predict_prob(datas) {
		let preds = this._trees.map(t => t.predict_prob(datas));
		let ret = [];
		for (let i = 0; i < datas.length; i++) {
			let prob = new Map();
			for (let n = 0; n < preds.length; n++) {
				preds[n][i].forEach((v, k) => {
					prob.set(k, (prob.get(k) || 0) + v);
				});
			}
			prob.forEach((v, k) => {
				prob.set(k, v / preds.length);
			});
			ret.push(prob);
		}
		return ret;
	}

	predict(datas) {
		if (this._trees[0].predict_prob) {
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
		} else {
			let pred = this._trees.map(t => t.predict(datas));
			let ret = [];
			for (let i = 0; i < datas.length; i++) {
				ret.push(pred.reduce((acc, v) => acc + v[i], 0) / pred.length);
			}
			return ret;
		}
	}
}

var dispRandomForest = function(elm, platform) {
	const mode = platform.task
	let tree = null;
	let step = 4;

	const dispRange = function() {
		platform.predict(
			(px, pred_cb) => {
				let pred = tree.predict(px);
				pred_cb(pred);
			},
			step,
			1
		);
	};

	elm.append("select")
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
	elm.append("span")
		.text(" Tree #");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "tree_num")
		.property("value", 50)
		.attr("min", 1)
		.attr("max", 200);
	elm.append("span")
		.text(" Sampling rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "srate")
		.property("value", 0.2)
		.attr("min", 0.1)
		.attr("max", 1)
		.attr("step", 0.1);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Initialize")
		.on("click", () => {
			if (platform.datas.length == 0) {
				tree = null;
				elm.select("[name=depthnumber]")
					.text("0");
				return;
			}
			const tree_num = +elm.select("input[name=tree_num]").property("value");
			const srate = +elm.select("input[name=srate]").property("value");
			platform.datas.scale = 1
			if (mode == "CF") {
				tree = new RandomForest(tree_num, srate, DecisionTreeClassifier);
			} else {
				tree = new RandomForest(tree_num, srate, DecisionTreeRegression);
			}
			tree.init(platform.datas.x, platform.datas.y)
			dispRange();

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

			dispRange();

			elm.select("[name=depthnumber]")
				.text(tree.depth);
		});
	elm.append("span")
		.attr("name", "depthnumber")
		.text("0");
	elm.append("span")
		.text(" depth ");
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Separate".'
	dispRandomForest(platform.setting.ml.configElement, platform)
}
