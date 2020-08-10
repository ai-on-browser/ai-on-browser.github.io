import FittingMode from '../js/fitting.js'

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

var dispPLS = function(elm, mode, setting) {
	const svg = d3.select("svg");

	const fitModel = (cb) => {
		const dim = setting.dimension
		FittingMode.RG(dim).fit(svg, points, (dim === 1 ? 100 : 4),
			(tx, ty, px, pred_cb) => {
				const x = Matrix.fromArray(tx);
				const t = new Matrix(ty.length, 1, ty);

				const model = new PLS();
				model.init(x, t);
				model.fit(x, t);

				const pred_values = Matrix.fromArray(px);
				const pred = model.predict(pred_values).value;
				pred_cb(pred);
			}
		);
	};

	elm.select(".buttons")
		.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

var pls_init = function(root, mode, setting) {
	root.selectAll("*").remove();
	let div = root.append("div");
	div.append("p").text('Click and add data point. Next, click "Fit" button.');
	div.append("div").classed("buttons", true);
	dispPLS(root, mode, setting);

	setting.terminate = () => {
		d3.selectAll("svg .tile").remove();
	};
}

export default pls_init

