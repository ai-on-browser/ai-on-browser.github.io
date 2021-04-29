class IsolationTree {
	// https://www.slideshare.net/kataware/isolation-forest
	// https://cs.nju.edu.cn/zhouzh/zhouzh.files/publication/icdm08b.pdf
	constructor(datas) {
		this._datas = datas;
		this._tree = new Tree({});
		this._features = datas[0].length;
		this._n = datas.length;
	}

	get c() {
		const n = this._n;
		return 2 * Math.log(n - 1) + 0.5772156649 - (2 * (n - 1) / n);
	}

	_separate(d) {
		const n = d.length;
		if (n <= 1) {
			return
		}
		const separatables = []
		const minmax = []
		for (let i = 0; i < this._features; i++) {
			let min = Infinity, max = -Infinity;
			for (let k = 0; k < n; k++) {
				min = Math.min(min, d[k][i]);
				max = Math.max(max, d[k][i]);
			}
			if (min < max) {
				minmax.push([min, max]);
				separatables.push(i);
			}
		}
		if (separatables.length === 0) {
			return
		}
		const idx = Math.floor(Math.random() * separatables.length);
		const sepF = separatables[idx];
		const sepV = Math.random() * (minmax[idx][1] - minmax[idx][0]) + minmax[idx][0];
		return [sepF, sepV];
	}

	fit() {
		const nodes = [[this._tree, this._datas]];
		while (nodes.length > 0) {
			const [node, data] = nodes.pop();
			if (node.isLeaf()) {
				const sep = this._separate(data);
				if (!sep) {
					continue;
				}
				const [f, th] = sep;
				node.value.feature = f;
				node.value.threshold = th;
				node.push({});
				node.push({});
			}
			const leftData = [];
			const rightData = [];
			for (let i = 0; i < data.length; i++) {
				if (data[i][node.value.feature] <= node.value.threshold) {
					leftData.push(data[i]);
				} else {
					rightData.push(data[i]);
				}
			}
			nodes.push([node.at(0), leftData]);
			nodes.push([node.at(1), rightData]);
		}
	}

	depth(data) {
		return data.map(d => {
			let t = this._tree;
			let depth = 0;
			while (!t.isLeaf()) {
				t = (d[t.value.feature] <= t.value.threshold) ? t.at(0) : t.at(1);
				depth++;
			}
			return depth;
		});
	}
}

class IsolationForest {
	constructor(datas, tree_num, sampling_rate = 0.8) {
		this._trees = [];
		let en = Math.ceil(datas.length * sampling_rate);
		let idx = [];
		for (let i = 0; i < datas.length; idx.push(i++));
		for (let i = 0; i < tree_num; i++) {
			shuffle(idx);
			let tdata = [];
			for (let k = 0; k < en; k++) {
				tdata.push(datas[idx[k]]);
			}
			this._trees.push(new IsolationTree(tdata));
		}
	}

	fit() {
		this._trees.forEach(t => t.fit());
	}

	predict(datas) {
		const n = datas.length;
		const depthes = this._trees.map(t => t.depth(datas));
		const c = this._trees.reduce((s, t) => s + t.c, 0) / this._trees.length;
		const outliers = [];
		for (let i = 0; i < n; i++) {
			let e = 0;
			for (let k = 0; k < depthes.length; k++) {
				e += depthes[k][i];
			}
			e /= depthes.length;
			outliers.push(2 ** (-e / c))
		}
		return outliers;
	}
}

var dispIsolationForest = function(elm, platform) {
	let model = null;

	const calcIsolationForest = function() {
		platform.fit((tx, ty, cb) => {
			const tree_num = +elm.select("input[name=tree_num]").property("value");
			const srate = +elm.select("input[name=srate]").property("value");
			const threshold = +elm.select("input[name=threshold]").property("value");
			model = new IsolationForest(tx, tree_num, srate, threshold)
			model.fit(tx);
			const outliers = model.predict(tx).map(v => v > threshold)
			cb(outliers)
			platform.predict((px, pred_cb) => {
				const outlier_tiles = model.predict(px).map(v => v > threshold)
				pred_cb(outlier_tiles)
			}, 3)
		})
	}

	elm.append("span")
		.text(" Tree #");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "tree_num")
		.property("value", 100)
		.attr("min", 1)
		.attr("max", 1000);
	elm.append("span")
		.text(" Sampling rate ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "srate")
		.property("value", 0.6)
		.attr("min", 0.1)
		.attr("max", 1)
		.attr("step", 0.1);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calcIsolationForest);
	elm.append("span")
		.text(" threshold = ");
	elm.append("input")
		.attr("type", "number")
		.attr("name", "threshold")
		.attr("value", 0.5)
		.attr("min", 0)
		.attr("max", 1)
		.property("required", true)
		.attr("step", 0.01)
		.on("change", () => {
			platform.fit((tx, ty, cb) => {
				const threshold = +elm.select("input[name=threshold]").property("value");
				const outliers = model.predict(tx).map(v => v > threshold)
				cb(outliers)
				platform.predict((px, pred_cb) => {
					const outlier_tiles = model.predict(px).map(v => v > threshold)
					pred_cb(outlier_tiles)
				}, 3)
			})
		})
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispIsolationForest(platform.setting.ml.configElement, platform);
}
