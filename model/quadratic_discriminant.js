class QuadraticDiscriminant {
	// https://arxiv.org/abs/1906.02590
	constructor() {
		this._x = null;
		this._y = null;
		this._w = null;
		this._c = null;
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
		const s0 = x0.cov();
		const s1 = x1.cov();
		const s0inv = s0.inv();
		const s1inv = s1.inv();

		this._w = m0.dot(s0inv).copySub(m1.dot(s1inv)).t
		this._c = s1.copySub(s0).inv();
		this._c.div(2)
		this._w0 = m1.dot(s1inv).dot(m1.t).value[0] - m0.dot(s0inv).dot(m0.t).value[0] + Math.log(s1.det() / s0.det()) + 2 * Math.log(x0.rows / x1.rows);
	}

	predict(data) {
		const x = Matrix.fromArray(data);
		const r = x.dot(this._w);
		r.add(this._w0 / 2)
		for (let i = 0; i < x.rows; i++) {
			const ri = x.row(i);
			r.addAt(i, 0, ri.dot(this._c).dot(ri.t).value[0]);
		}
		//this._s(r)
		//r.sub(0.5)
		console.log(r)
		return r.value
	}
}

var dispQuadraticDiscriminant = function(elm) {
	const svg = d3.select("svg");

	const calc = (cb) => {
		const method = elm.select(".buttons [name=method]").property("value")
		FittingMode.CF.fit(svg, points, 3, (tx, ty, px, pred_cb) => {
			ty = ty.map(v => v[0])
			const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
			const m = new cls(QuadraticDiscriminant, [...new Set(ty)])
			m.init(tx, ty);
			m.fit()
			const categories = m.predict(px);
			pred_cb(categories)
			cb && cb()
		})
	}

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

var quadratic_discriminant_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Then, click "Calculate".');
	div.append("div").classed("buttons", true);
	dispQuadraticDiscriminant(root);

	setting.setTerminate(() => {
		d3.selectAll("svg .tile").remove();
	});
}
