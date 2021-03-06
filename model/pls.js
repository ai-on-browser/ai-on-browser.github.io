class PLS {
	constructor() {
	}

	init(x, y) {
		this._x = Matrix.fromArray(x);
		this._y = Matrix.fromArray(y);
	}

	fit() {
		if (this._y.cols === 1) {
			[this._b, this._b0] = this._pls1();
		} else {
			throw "";
		}
	}

	_pls1() {
		// https://ja.wikipedia.org/wiki/部分的最小二乗回帰
		let x = this._x.copy();
		let w = x.tDot(this._y);
		w.div(w.norm());
		let t = x.dot(w);

		const ws = []
		const ps = []
		const qs = []
		for (let k = 0; k < x.cols; k++) {
			const tk = t.tDot(t).value[0];
			t.div(tk)
			const p = x.tDot(t);
			const qk = this._y.tDot(t).value[0];

			ps.push(p.value);
			qs.push(qk);
			ws.push(w.value)
			if (qk === 0) break;

			const xsub = t.dot(p.t)
			xsub.mult(tk)
			x.sub(xsub);
			w = x.tDot(this._y);
			t = x.dot(w);
		}
		const W = Matrix.fromArray(ws).t;
		const P = Matrix.fromArray(ps).t;
		const q = new Matrix(qs.length, 1, qs);

		const B = W.dot(P.tDot(W).slove(q));
		const B0 = qs[0] - P.col(0).tDot(B).value[0];
		return [B, B0]
	}

	predict(x) {
		return x.dot(this._b).copyAdd(this._b0);
	}
}

var dispPLS = function(elm, platform) {
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		platform.fit((tx, ty) => {
			const x = Matrix.fromArray(tx);
			const t = new Matrix(ty.length, 1, ty);

			const model = new PLS();
			model.init(x, t);
			model.fit();

			platform.predict((px, pred_cb) => {
				const pred_values = Matrix.fromArray(px);
				const pred = model.predict(pred_values).value;
				pred_cb(pred);
			}, dim === 1 ? 100 : 4)
		});
	};

	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPLS(platform.setting.ml.configElement, platform);
}
