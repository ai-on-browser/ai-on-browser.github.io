class Ridge {
	constructor(lambda = 0.1) {
		this._w = null;
		this._lambda = lambda;
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const xh = x.resize(x.rows, x.cols + 1, 1);
		const xtx = xh.tDot(xh);
		for (let i = 0; i < xtx.rows; i++) {
			xtx.addAt(i, i, this._lambda)
		}

		this._w = xtx.slove(xh.t).dot(y);
	}

	predict(x) {
		x = Matrix.fromArray(x)
		let xh = x.resize(x.rows, x.cols + 1, 1);
		return xh.dot(this._w).value;
	}

	importance() {
		return this._w.resize(this._w.rows - 1, this._w.cols)
	}
}

class KernelRidge {
	constructor(lambda = 0.1, kernel = null) {
		this._w = null;
		this._x = null;
		this._lambda = lambda;
		this._kernel = kernel;
	}

	fit(x, y) {
		x = Matrix.fromArray(x)
		y = Matrix.fromArray(y)
		const K = new Matrix(x.rows, x.rows);
		this._x = []
		for (let i = 0; i < x.rows; i++) {
			this._x.push(x.row(i));
			K.set(i, i, this._kernel(this._x[i], this._x[i]) + this._lambda);
			for (let j = 0; j < i; j++) {
				const v = this._kernel(this._x[i], this._x[j])
				K.set(i, j, v);
				K.set(j, i, v);
			}
		}
		this._w = K.slove(y);
	}

	predict(x) {
		x = Matrix.fromArray(x)
		const K = new Matrix(x.rows, this._x.length);
		for (let i = 0; i < x.rows; i++) {
			const xi = x.row(i);
			for (let j = 0; j < this._x.length; j++) {
				const v = this._kernel(xi, this._x[j])
				K.set(i, j, v);
			}
		}
		return K.dot(this._w).value;
	}

	importance() {
		return this._w.resize(this._w.rows - 1, this._w.cols)
	}
}

class RidgeClassifier {
	constructor(lambda = 0.1, kernel = null) {
		if (kernel) {
			this._model = new KernelRidge(lambda, kernel)
		} else {
			this._model = new Ridge(lambda)
		}
	}

	init(train_x, train_y) {
		this._x = train_x;
		this._y = train_y;
	}

	fit() {
		this._model.fit(this._x, this._y)
	}

	predict(data) {
		return this._model.predict(data)
	}
}

var dispRidge = function(elm, platform) {
	const task = platform.task
	const fitModel = (cb) => {
		const dim = platform.datas.dimension
		const kernel = elm.select("[name=kernel]").property("value")
		const kernelFunc = kernel === 'gaussian' ? KernelFunction.gaussian : null;
		platform.fit((tx, ty, fit_cb) => {
			let model
			const l = +elm.select("[name=lambda]").property("value")
			if (task === 'CF') {
				const method = elm.select("[name=method]").property("value")
				const cls = method === "oneone" ? OneVsOneModel : OneVsAllModel;
				model = new cls(RidgeClassifier, new Set(ty.map(v => v[0])), [l, kernelFunc])
				model.init(tx, ty);
			} else {
				if (kernelFunc) {
					model = new KernelRidge(l, kernelFunc);
				} else {
					model = new Ridge(l);
				}
			}
			model.fit(tx, ty);

			if (task === 'FS') {
				const imp = model.importance()
				const impi = imp.value.map((i, k) => [i, k])
				impi.sort((a, b) => b[0] - a[0])
				const tdim = platform.dimension
				const idx = impi.map(i => i[1]).slice(0, tdim)
				const x = Matrix.fromArray(tx);
				fit_cb(x.col(idx).toArray())
			} else {
				platform.predict((px, pred_cb) => {
					let pred = model.predict(px);
					pred_cb(pred);
				}, kernelFunc ? (dim === 1 ? 1 : 10) : (dim === 1 ? 100 : 4))
			}
		});
	};

	if (task === 'CF') {
		elm.append("select")
			.attr("name", "method")
			.selectAll("option")
			.data(["oneone", "oneall"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	}
	if (task !== 'FS') {
		elm.append("select")
			.attr("name", "kernel")
			.selectAll("option")
			.data(["no kernel", "gaussian"])
			.enter()
			.append("option")
			.property("value", d => d)
			.text(d => d);
	} else {
		elm.append("input")
			.attr("type", "hidden")
			.attr("name", "kernel")
			.property("value", "")
	}
	elm.append("span")
		.text("lambda = ");
	elm.append("select")
		.attr("name", "lambda")
		.selectAll("option")
		.data([0, 0.0001, 0.001, 0.01, 0.1, 1, 10, 100])
		.enter()
		.append("option")
		.property("value", d => d)
		.text(d => d);
	elm.append("input")
		.attr("type", "button")
		.attr("value", "Fit")
		.on("click", () => fitModel());
}

export default function(platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispRidge(platform.setting.ml.configElement, platform);
	platform.setting.ml.detail = `
The model form is
$$
f(X) = X W + \\epsilon
$$

The loss function can be written as
$$
L(W) = \\| X W - y \\|^2 + \\lambda \\| W \\|^2
$$
where $ y $ is the observed value corresponding to $ X $.
Therefore, the optimum parameter $ \\hat{W} $ is estimated as
$$
\\hat{W} = \\left( X^T X + \\lambda I \\right)^{-1} X^T y
$$
`
}
