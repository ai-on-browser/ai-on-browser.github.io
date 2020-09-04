class LinearDiscriminant {
	// http://alice.info.kogakuin.ac.jp/public_data/2013/J110033b.pdf
	constructor() {
		this._x = null;
		this._y = null;
		this._w = null;
		this._w0 = null;
	}

	_s(x) {
		x.map(v => 1 / (1 + Math.exp(-v)));
	}

	init(train_x, train_y) {
		this._x = train_x;
		this._y = train_y;
	}

	fit() {
		const x = Matrix.fromArray(this._x);
		const d = x.cols;
		const x0 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === 1));
		const x1 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === -1));
		const m0 = x0.mean(0);
		const m1 = x1.mean(0);
		const s = x.cov();
		const sinv = s.inv();

		this._w = m0.copySub(m1).dot(sinv).t
		this._w0 = -m0.dot(sinv).dot(m0.t).value[0] / 2 + m1.dot(sinv).dot(m1.t).value[0] / 2 + Math.log(x0.rows / x1.rows);
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		const r = x.dot(this._w);
		r.add(this._w0)
		this._s(r)
		r.sub(0.5)
		return r.value
	}
}

class FishersLinearDiscriminant {
	constructor() {
		this._x = null;
		this._y = null;
		this._w = null;
		this._m = null;
	}

	init(train_x, train_y) {
		this._x = train_x;
		this._y = train_y;
	}

	fit() {
		const x0 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === 1));
		const x1 = Matrix.fromArray(this._x.filter((v, i) => this._y[i] === -1));
		const m0 = x0.mean(0);
		const m1 = x1.mean(0);
		x0.sub(m0);
		x1.sub(m1);

		const Sw = x0.tDot(x0);
		Sw.add(x1.tDot(x1));
		this._w = m0.copySub(m1).dot(Sw.inv()).t
		this._m = Matrix.fromArray(this._x).mean(0);
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		x.sub(this._m);
		return x.dot(this._w).value
	}
}

var dispLinearDiscriminant = function(elm, platform) {
	const calc = (cb) => {
		const method = elm.select(".buttons [name=method]").property("value")
		const model = elm.select(".buttons [name=model]").property("value")
		platform.plot((tx, ty, px, pred_cb) => {
			ty = ty.map(v => v[0])
			const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
			const model_cls = model === "FLD" ? FishersLinearDiscriminant : LinearDiscriminant;
			const m = new cls(model_cls, new Set(ty))
			m.init(tx, ty);
			m.fit()
			const categories = m.predict(px);
			pred_cb(categories)
			cb && cb()
		}, 3)
	}

	elm.select(".buttons")
		.append("select")
		.attr("name", "model")
		.selectAll("option")
		.data(["FLD", "LDA"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("select")
		.attr("name", "method")
		.selectAll("option")
		.data(["oneone", "oneall"])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

var linear_discriminant_init = function(platform) {
	const root = platform.setting.ml.configElement
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispLinearDiscriminant(root, platform);
}

export default linear_discriminant_init
