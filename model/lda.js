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

const LinearDiscriminantAnalysis = function(x, t, rd = 0) {
	// https://axa.biopapyrus.jp/machine-learning/preprocessing/lda.html
	const d = x.cols;
	const n = x.rows;
	let c = {};
	let cn = 0;
	for (let i = 0; i < n; i++) {
		if (c[t[i]] === undefined) c[t[i]] = cn++;
		t[i] = c[t[i]];
	}

	const mean = x.mean(0).value;
	let cmean = [];
	for (let i = 0; i < cn; cmean[i++] = Array(d).fill(0));
	let cnum = Array(cn).fill(0);
	for (let k = 0; k < n; k++) {
		cnum[t[k]]++;
		for (let j = 0; j < d; j++) {
			cmean[t[k]][j] += x.at(k, j);
		}
	}
	for (let i = 0; i < cn; i++) {
		for (let j = 0; j < d; j++) {
			cmean[i][j] /= cnum[i];
		}
	}

	let w = [];
	for (let i = 0; i < d; w[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0;
			for (let k = 0; k < n; k++) {
				v += (x.at(k, i) - cmean[t[k]][i]) * (x.at(k, j) - cmean[t[k]][j]);
			}
			w[i][j] = w[j][i] = v / n;
		}
	}
	w = new Matrix(d, d, w);

	let b = [];
	for (let i = 0; i < d; b[i++] = []);
	for (let i = 0; i < d; i++) {
		for (let j = 0; j <= i; j++) {
			let v = 0;
			for (let k = 0; k < cn; k++) {
				v += (cmean[k][i] - mean[i]) * (cmean[k][j] - mean[j]) * cnum[k];
			}
			b[i][j] = b[j][i] = v / n;
		}
	}
	b = new Matrix(d, d, b);

	let cov = w.slove(b);
	let ev = cov.eigenVectors();
	if (rd > 0 && rd < ev.cols) {
		ev = ev.resize(ev.rows, rd);
	}
	return x.dot(ev);
}

var dispLDA = function(elm, platform) {
	const calc = (cb) => {
		platform.plot((tx, ty, px, pred_cb) => {
			if (platform.task === 'CF') {
				const method = elm.select("[name=method]").property("value")
				const model = elm.select("[name=model]").property("value")
				ty = ty.map(v => v[0])
				const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
				const model_cls = model === "FLD" ? FishersLinearDiscriminant : LinearDiscriminant;
				const m = new cls(model_cls, new Set(ty))
				m.init(tx, ty);
				m.fit()
				const categories = m.predict(px);
				pred_cb(categories)
			} else {
				const tx_mat = Matrix.fromArray(tx);
				const dim = platform.setting.dimension;
				let y = LinearDiscriminantAnalysis(tx_mat, ty, dim);
				pred_cb(y.toArray());
			}
			cb && cb()
		}, 3)
	}

	if (platform.task === 'CF') {
		elm.append("select")
			.attr("name", "model")
			.selectAll("option")
			.data(["FLD", "LDA"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
		elm.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "oneall"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Calculate")
		.on("click", calc);
}

export default function(platform) {
	platform.setting.ml.description = 'Click and add data point. Then, click "Calculate".'
	dispLDA(platform.setting.ml.configElement, platform);
}
